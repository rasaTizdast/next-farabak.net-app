import { Prisma } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/prisma";

import { commentTag } from "./cache";
import {
  approvedTopLevelComments,
  assertPublicCommentTarget,
  commentTargetFields,
} from "./service";
import { CommentError, type CommentTarget, type PublicCommentPage } from "./types";
import { commentIdSchema, commentTargetSchema } from "./validation";

const pageSize = 20;
const publicFields = {
  id: true,
  displayName: true,
  body: true,
  presentation: true,
  publishedAt: true,
} as const satisfies Prisma.PublicCommentSelect;

async function readApprovedPage(
  target: CommentTarget,
  cursor?: number
): Promise<PublicCommentPage> {
  const targetFields = commentTargetFields(target);
  const topLevel = approvedTopLevelComments(target);

  const rows = await prisma.$transaction(
    async (db) => {
      if (cursor !== undefined) {
        const anchor = await db.publicComment.findFirst({
          where: { ...topLevel, id: cursor },
          select: { id: true },
        });
        if (!anchor)
          throw new CommentError(400, "INVALID_CURSOR", "The comment page cursor is invalid.");
      }

      return db.publicComment.findMany({
        where: topLevel,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: pageSize + 1,
        ...(cursor === undefined ? {} : { cursor: { id: cursor }, skip: 1 }),
        select: {
          ...publicFields,
          replies: {
            where: { ...targetFields, status: "APPROVED", presentation: "EDITORIAL" },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            select: publicFields,
          },
        },
      });
    },
    // Keep the cursor, parents, and replies on the same snapshot across Prisma's reads.
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead }
  );

  const comments = rows.slice(0, pageSize).map(({ replies, ...comment }) => ({
    ...comment,
    publishedAt: comment.publishedAt?.toISOString() ?? null,
    replies: replies.map((reply) => ({
      ...reply,
      publishedAt: reply.publishedAt?.toISOString() ?? null,
    })),
  }));

  return { comments, nextCursor: rows.length > pageSize ? comments[pageSize - 1].id : null };
}

async function readFirstApprovedPage(target: CommentTarget): Promise<PublicCommentPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag(commentTag(target));
  return readApprovedPage(target);
}

export async function listApprovedComments(
  target: CommentTarget,
  cursor?: number
): Promise<PublicCommentPage> {
  const parsed = commentTargetSchema.safeParse(target);
  if (!parsed.success)
    throw new CommentError(400, "INVALID_TARGET", "The comment target is invalid.");
  if (cursor !== undefined && !commentIdSchema.safeParse(cursor).success) {
    throw new CommentError(400, "INVALID_CURSOR", "The comment page cursor is invalid.");
  }

  // Visibility can change independently of the comment cache.
  await assertPublicCommentTarget(prisma, parsed.data);
  return cursor === undefined
    ? readFirstApprovedPage(parsed.data)
    : readApprovedPage(parsed.data, cursor);
}
