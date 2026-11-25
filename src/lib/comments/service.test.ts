import { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { moderateComment, submitComment } from "./service";
import type { CommentSubmission } from "./types";

const db = vi.hoisted(() => ({
  client: { findUnique: vi.fn() },
  blogs: { findFirst: vi.fn() },
  product: { findFirst: vi.fn() },
  publicComment: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: db }));

const member = { Role: "Public", FirstName: " علی ", LastName: " رضایی " };
const admin = { Role: "Admin", FirstName: null, LastName: null };
const submission = {
  target: { type: "blog", id: 7 },
  body: "  پرسش درباره نصب  ",
  mode: "member",
} as const;
const reply = { ...submission, mode: "editorial", parentId: 21 } as const;
const alias = { ...submission, mode: "alias", alias: " راهنمای نصب " } as const;
const conflict = new Prisma.PrismaClientKnownRequestError("Serialization conflict", {
  code: "P2034",
  clientVersion: "test",
});

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation(async (write) => write(db));
  db.client.findUnique.mockResolvedValue(member);
  db.blogs.findFirst.mockResolvedValue({ id: 7 });
  db.product.findFirst.mockResolvedValue({ ProductId: 7 });
  db.publicComment.findFirst.mockResolvedValue({ id: 21 });
  db.publicComment.count.mockResolvedValue(0);
  db.publicComment.create.mockResolvedValue({ id: 25 });
  db.publicComment.findUnique.mockResolvedValue({
    id: 25,
    blogId: 7,
    productId: null,
    parentId: null,
    status: "PENDING",
    presentation: "MEMBER",
  });
});

describe("submitComment", () => {
  it("writes a pending comment with the current account's trimmed name and literal body", async () => {
    await expect(submitComment(submission, 18)).resolves.toEqual({ id: 25, status: "PENDING" });

    expect(db.client.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { UserID: 18 } })
    );
    expect(db.publicComment.create).toHaveBeenCalledWith({
      data: {
        actorId: 18,
        blogId: 7,
        displayName: "علی رضایی",
        body: "پرسش درباره نصب",
        presentation: "MEMBER",
        parentId: null,
        status: "PENDING",
      },
      select: { id: true },
    });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a valid session for a deleted account", async () => {
    db.client.findUnique.mockResolvedValue(null);
    await expect(submitComment(submission, 18)).rejects.toMatchObject({ status: 401 });
    expect(db.publicComment.create).not.toHaveBeenCalled();
  });

  it.each([{ FirstName: null }, { LastName: "   " }])(
    "requires both names for member submissions (%o)",
    async (missingName) => {
      db.client.findUnique.mockResolvedValue({ ...member, ...missingName });
      await expect(submitComment(submission, 18)).rejects.toMatchObject({
        code: "PROFILE_NAME_REQUIRED",
      });
      expect(db.publicComment.create).not.toHaveBeenCalled();
    }
  );

  it.each([alias, reply])("uses current privileges for the $mode mode", async (input) => {
    await expect(submitComment(input, 18)).rejects.toMatchObject({ status: 403 });
    expect(db.publicComment.create).not.toHaveBeenCalled();
  });

  it("records the actor and trimmed public alias for an administrator", async () => {
    db.client.findUnique.mockResolvedValue(admin);
    await submitComment(alias, 18);
    expect(db.publicComment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: 18,
          displayName: "راهنمای نصب",
          presentation: "ALIAS",
          status: "PENDING",
          parentId: null,
        }),
      })
    );
  });

  it("records a pending editorial reply under an approved top-level comment on the same target", async () => {
    db.client.findUnique.mockResolvedValue(admin);
    await submitComment(reply, 18);
    expect(db.publicComment.findFirst).toHaveBeenCalledWith({
      where: {
        id: 21,
        blogId: 7,
        parentId: null,
        status: "APPROVED",
        presentation: { not: "EDITORIAL" },
      },
      select: { id: true },
    });
    expect(db.publicComment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: 18,
          displayName: "پاسخ تیم فرابک",
          presentation: "EDITORIAL",
          status: "PENDING",
          parentId: 21,
        }),
      })
    );
  });

  it("rejects replies to parents that are missing, unapproved, nested or on another target", async () => {
    db.client.findUnique.mockResolvedValue(admin);
    db.publicComment.findFirst.mockResolvedValue(null);
    await expect(submitComment(reply, 18)).rejects.toMatchObject({ code: "PARENT_NOT_APPROVED" });
    expect(db.publicComment.create).not.toHaveBeenCalled();
  });

  it("selects only published, non-QR blog targets", async () => {
    db.blogs.findFirst.mockResolvedValue(null);
    await expect(submitComment(submission, 18)).rejects.toMatchObject({ status: 404 });
    expect(db.blogs.findFirst).toHaveBeenCalledWith({
      where: { id: 7, status: "Published", QrCode_key: null },
      select: { id: true },
    });
    expect(db.publicComment.create).not.toHaveBeenCalled();
  });

  it("selects only available, non-QR product targets", async () => {
    db.product.findFirst.mockResolvedValue(null);
    await expect(
      submitComment({ ...submission, target: { type: "product", id: 7 } }, 18)
    ).rejects.toMatchObject({
      status: 404,
    });
    expect(db.product.findFirst).toHaveBeenCalledWith({
      where: { ProductId: 7, Available: true, QrCode_Key: null },
      select: { ProductId: true },
    });
  });

  it.each([
    { ...submission, displayName: "Forged Name" },
    { ...submission, alias: "alias" },
    { ...submission, parentId: 8 },
    { ...alias, parentId: 8 },
    { ...reply, alias: "alias" },
    { ...reply, parentId: undefined },
  ])("rejects forged identity or unsupported mode fields (%o)", async (input) => {
    await expect(submitComment(input as CommentSubmission, 18)).rejects.toMatchObject({
      status: 400,
    });
    expect(db.publicComment.create).not.toHaveBeenCalled();
  });

  it("rejects the sixth submission across all targets and statuses in a ten-minute window", async () => {
    const now = new Date("2026-11-23T10:00:00Z");
    vi.useFakeTimers().setSystemTime(now);
    db.publicComment.count.mockResolvedValue(5);

    try {
      await expect(submitComment(submission, 18)).rejects.toMatchObject({ status: 429 });
      expect(db.publicComment.count).toHaveBeenCalledWith({
        where: { actorId: 18, createdAt: { gte: new Date("2026-11-23T09:50:00Z") } },
      });
      expect(db.publicComment.create).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("retries a serialization failure against a fresh quota snapshot", async () => {
    db.$transaction.mockRejectedValueOnce(conflict);
    db.publicComment.count.mockResolvedValue(4);
    await expect(submitComment(submission, 18)).resolves.toEqual({ id: 25, status: "PENDING" });
    expect(db.$transaction).toHaveBeenCalledTimes(2);
    expect(db.$transaction).toHaveBeenLastCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it("bounds serialization retries", async () => {
    db.$transaction.mockRejectedValue(conflict);
    await expect(submitComment(submission, 18)).rejects.toMatchObject({ status: 503 });
    expect(db.$transaction).toHaveBeenCalledTimes(3);
  });
});

describe("moderateComment", () => {
  beforeEach(() => {
    db.client.findUnique.mockResolvedValue(admin);
  });

  it("blocks a previously privileged reviewer whose current role is not Admin", async () => {
    db.client.findUnique.mockResolvedValue(member);
    await expect(moderateComment(25, "APPROVED", 18)).rejects.toMatchObject({ status: 403 });
    expect(db.publicComment.update).not.toHaveBeenCalled();
  });

  it("records the approval and immediately expires only the affected target", async () => {
    await moderateComment(25, "APPROVED", 18, "  مناسب  ");
    expect(db.publicComment.update).toHaveBeenCalledWith({
      where: { id: 25, status: "PENDING" },
      data: {
        status: "APPROVED",
        reviewerId: 18,
        reviewNote: "مناسب",
        reviewedAt: expect.any(Date),
        publishedAt: expect.any(Date),
      },
    });
    expect(revalidateTag).toHaveBeenCalledWith("comments:blog:7", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("blogs", { expire: 0 });
  });

  it.each(["APPROVED", "REJECTED"] as const)(
    "preserves audit data on duplicate %s",
    async (status) => {
      db.publicComment.findUnique.mockResolvedValue({ id: 25, status, blogId: 7 });
      await expect(moderateComment(25, status, 18)).rejects.toMatchObject({ status: 409 });
      expect(db.publicComment.update).not.toHaveBeenCalled();
      expect(revalidateTag).not.toHaveBeenCalled();
    }
  );

  it("treats a conflicting decision on a rejected comment as a conflict", async () => {
    db.publicComment.findUnique.mockResolvedValue({ id: 25, status: "REJECTED", blogId: 7 });
    await expect(moderateComment(25, "APPROVED", 18)).rejects.toMatchObject({ status: 409 });
    expect(db.publicComment.update).not.toHaveBeenCalled();
  });

  it("requires a reason to hide an approved comment", async () => {
    db.publicComment.findUnique.mockResolvedValue({ id: 25, status: "APPROVED", blogId: 7 });
    await expect(moderateComment(25, "REJECTED", 18, " ")).rejects.toMatchObject({ status: 400 });
    expect(db.publicComment.update).not.toHaveBeenCalled();
  });

  it("hides an approved product comment and expires its target immediately", async () => {
    db.publicComment.findUnique.mockResolvedValue({
      id: 25,
      status: "APPROVED",
      blogId: null,
      productId: 7,
    });
    await moderateComment(25, "REJECTED", 18, "دلیل پنهان کردن");
    expect(db.publicComment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "REJECTED",
          reviewerId: 18,
          reviewNote: "دلیل پنهان کردن",
        }),
      })
    );
    expect(revalidateTag).toHaveBeenCalledWith("comments:product:7", { expire: 0 });
  });

  it("commits a pending rejection without changing the public cache", async () => {
    await moderateComment(25, "REJECTED", 18);
    expect(db.publicComment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "REJECTED", publishedAt: null }),
      })
    );
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses to approve an editorial reply when its parent has been hidden", async () => {
    db.publicComment.findUnique.mockResolvedValue({
      id: 25,
      status: "PENDING",
      blogId: 7,
      parentId: 21,
      presentation: "EDITORIAL",
    });
    db.publicComment.findFirst.mockResolvedValue(null);
    await expect(moderateComment(25, "APPROVED", 18)).rejects.toMatchObject({
      code: "PARENT_NOT_APPROVED",
    });
    expect(db.publicComment.update).not.toHaveBeenCalled();
  });
});
