import { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";

import { TAGS } from "@/lib/data/tags";
import { prisma } from "@/lib/prisma";

import { commentTag } from "./cache";
import {
  CommentError,
  type CommentDecision,
  type CommentSubmission,
  type CommentTarget,
} from "./types";
import { commentIdSchema, commentModerationSchema, commentSubmissionSchema } from "./validation";

const submissionsPerWindow = 5;
const rateWindowMs = 10 * 60 * 1000;
const submissionAttempts = 3;
const serializable = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable };

export function commentTargetFields(target: CommentTarget) {
  return target.type === "blog" ? { blogId: target.id } : { productId: target.id };
}

export function approvedTopLevelComments(target: CommentTarget): Prisma.PublicCommentWhereInput {
  return {
    ...commentTargetFields(target),
    parentId: null,
    status: "APPROVED",
    presentation: { not: "EDITORIAL" },
  };
}

export async function assertPublicCommentTarget(
  db: Pick<Prisma.TransactionClient, "blogs" | "product">,
  target: CommentTarget
): Promise<void> {
  const publicTarget =
    target.type === "blog"
      ? await db.blogs.findFirst({
          where: { id: target.id, status: "Published", QrCode_key: null },
          select: { id: true },
        })
      : await db.product.findFirst({
          where: {
            ProductId: target.id,
            Available: true,
            OR: [{ QrCode_Key: null }, { QrCode_Key: "" }],
          },
          select: { ProductId: true },
        });

  if (!publicTarget)
    throw new CommentError(404, "TARGET_NOT_FOUND", "The comment target is unavailable.");
}

async function loadActor(db: Prisma.TransactionClient, actorId: number) {
  if (!commentIdSchema.safeParse(actorId).success) {
    throw new CommentError(401, "ACCOUNT_NOT_FOUND", "Sign in to continue.");
  }

  const actor = await db.client.findUnique({
    where: { UserID: actorId },
    select: { FirstName: true, LastName: true, Role: true },
  });
  if (!actor) throw new CommentError(401, "ACCOUNT_NOT_FOUND", "Sign in to continue.");
  return actor;
}

function requireAdmin(role: string | null) {
  if (role !== "Admin")
    throw new CommentError(403, "ADMIN_REQUIRED", "This action requires an administrator.");
}

async function assertApprovedParent(
  db: Prisma.TransactionClient,
  target: CommentTarget,
  parentId: number
) {
  const parent = await db.publicComment.findFirst({
    where: { ...approvedTopLevelComments(target), id: parentId },
    select: { id: true },
  });
  if (!parent) {
    throw new CommentError(
      409,
      "PARENT_NOT_APPROVED",
      "An approved top-level comment on this page is required."
    );
  }
}

function getPresentation(input: CommentSubmission, actor: Awaited<ReturnType<typeof loadActor>>) {
  if (input.mode !== "member") requireAdmin(actor.Role);

  if (input.mode === "alias") return { displayName: input.alias, presentation: "ALIAS" } as const;
  if (input.mode === "editorial")
    return { displayName: "پاسخ تیم فرابک", presentation: "EDITORIAL" } as const;

  const firstName = actor.FirstName?.trim();
  const lastName = actor.LastName?.trim();
  if (!firstName || !lastName) {
    throw new CommentError(
      400,
      "PROFILE_NAME_REQUIRED",
      "Add your first and last name to your profile."
    );
  }
  return { displayName: `${firstName} ${lastName}`, presentation: "MEMBER" } as const;
}

function isDatabaseError(error: unknown, code: string): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

export async function submitComment(
  input: CommentSubmission,
  actorId: number
): Promise<{ id: number; status: "PENDING" }> {
  const parsed = commentSubmissionSchema.safeParse(input);
  if (!parsed.success)
    throw new CommentError(400, "INVALID_COMMENT", "The comment fields are invalid.");

  const submission = parsed.data;
  const { target, body } = submission;
  for (let attempt = 1; attempt <= submissionAttempts; attempt += 1) {
    try {
      const { id } = await prisma.$transaction(async (db) => {
        const actor = await loadActor(db, actorId);
        const presentation = getPresentation(submission, actor);
        await assertPublicCommentTarget(db, target);

        const parentId = submission.mode === "editorial" ? submission.parentId : null;
        if (parentId !== null) await assertApprovedParent(db, target, parentId);

        // Serializable isolation makes a competing insert retry with a fresh quota count.
        const recent = await db.publicComment.count({
          where: { actorId, createdAt: { gte: new Date(Date.now() - rateWindowMs) } },
        });
        if (recent >= submissionsPerWindow) {
          throw new CommentError(
            429,
            "RATE_LIMITED",
            "You can submit up to five comments every ten minutes."
          );
        }

        return db.publicComment.create({
          data: {
            ...commentTargetFields(target),
            ...presentation,
            parentId,
            actorId,
            body,
            status: "PENDING",
          },
          select: { id: true },
        });
      }, serializable);
      return { id, status: "PENDING" };
    } catch (error) {
      if (!isDatabaseError(error, "P2034")) throw error;
    }
  }

  throw new CommentError(503, "SUBMISSION_BUSY", "Please try submitting the comment again.");
}

export async function moderateComment(
  id: number,
  decision: CommentDecision,
  reviewerId: number,
  note?: string
): Promise<void> {
  const parsed = commentModerationSchema.safeParse({ decision, note });
  if (!commentIdSchema.safeParse(id).success || !parsed.success) {
    throw new CommentError(400, "INVALID_DECISION", "The moderation fields are invalid.");
  }

  const reviewNote = parsed.data.note || null;
  const conflict = new CommentError(
    409,
    "MODERATION_CONFLICT",
    "The comment has already been reviewed."
  );
  const targetToExpire = await prisma
    .$transaction(async (db) => {
      const reviewer = await loadActor(db, reviewerId);
      requireAdmin(reviewer.Role);

      const comment = await db.publicComment.findUnique({
        where: { id },
        select: { blogId: true, productId: true, parentId: true, status: true, presentation: true },
      });
      if (!comment)
        throw new CommentError(404, "COMMENT_NOT_FOUND", "The comment could not be found.");

      const { blogId, productId, parentId, status, presentation } = comment;
      if (status === decision || status === "REJECTED") throw conflict;
      if (status === "APPROVED" && !reviewNote) {
        throw new CommentError(
          400,
          "REVIEW_NOTE_REQUIRED",
          "Enter a reason for hiding the comment."
        );
      }

      const target: CommentTarget =
        blogId !== null ? { type: "blog", id: blogId } : { type: "product", id: productId! };
      if (decision === "APPROVED") {
        await assertPublicCommentTarget(db, target);
        if (presentation === "EDITORIAL") {
          if (parentId === null) {
            throw new CommentError(
              409,
              "PARENT_NOT_APPROVED",
              "An approved top-level comment on this page is required."
            );
          }
          await assertApprovedParent(db, target, parentId);
        }
      }

      const reviewedAt = new Date();
      await db.publicComment.update({
        where: { id, status },
        data: {
          status: decision,
          reviewerId,
          reviewNote,
          reviewedAt,
          ...(status === "PENDING"
            ? { publishedAt: decision === "APPROVED" ? reviewedAt : null }
            : {}),
        },
      });

      return decision === "APPROVED" || status === "APPROVED" ? target : null;
    }, serializable)
    .catch((error: unknown) => {
      if (isDatabaseError(error, "P2034") || isDatabaseError(error, "P2025")) throw conflict;
      throw error;
    });

  if (targetToExpire) {
    revalidateTag(commentTag(targetToExpire), { expire: 0 });
    if (targetToExpire.type === "blog") revalidateTag(TAGS.blogs, { expire: 0 });
  }
}
