import { cacheTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listApprovedComments } from "./queries";

const db = vi.hoisted(() => ({
  blogs: { findFirst: vi.fn() },
  publicComment: { findFirst: vi.fn(), findMany: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: db }));

const blog = { type: "blog", id: 7 } as const;
const publishedAt = new Date("2026-11-23T10:15:00Z");
const topLevel = {
  id: 51,
  displayName: "علی رضایی",
  body: "پرسش درباره نصب",
  presentation: "MEMBER",
  publishedAt,
};
const reply = {
  id: 53,
  displayName: "پاسخ تیم فرابک",
  body: "پاسخ کامل به پرسش",
  presentation: "EDITORIAL",
  publishedAt,
};

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation(async (read) => read(db));
  db.blogs.findFirst.mockResolvedValue({ id: 7 });
  db.publicComment.findMany.mockResolvedValue([{ ...topLevel, replies: [reply] }]);
});

describe("listApprovedComments", () => {
  it("selects only approved top-level comments and approved same-target editorial replies", async () => {
    const page = await listApprovedComments(blog);

    expect(cacheTag).toHaveBeenCalledWith("comments:blog:7");
    expect(db.publicComment.findMany).toHaveBeenCalledWith({
      where: { blogId: 7, parentId: null, status: "APPROVED", presentation: { not: "EDITORIAL" } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 21,
      select: {
        id: true,
        body: true,
        displayName: true,
        presentation: true,
        publishedAt: true,
        replies: {
          where: { blogId: 7, status: "APPROVED", presentation: "EDITORIAL" },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: {
            id: true,
            body: true,
            displayName: true,
            presentation: true,
            publishedAt: true,
          },
        },
      },
    });
    expect(page).toEqual({
      comments: [
        {
          ...topLevel,
          publishedAt: "2026-11-23T10:15:00.000Z",
          replies: [{ ...reply, publishedAt: "2026-11-23T10:15:00.000Z" }],
        },
      ],
      nextCursor: null,
    });
  });

  it("returns the last visible row's ID after fetching a lookahead row", async () => {
    db.publicComment.findMany.mockResolvedValue(
      Array.from({ length: 21 }, (_, offset) => ({ ...topLevel, replies: [], id: 40 - offset }))
    );
    const page = await listApprovedComments(blog);
    expect(page.comments).toHaveLength(20);
    expect(page.nextCursor).toBe(21);
  });

  it("paginates even when the anchor was hidden after the previous page", async () => {
    db.publicComment.findFirst.mockResolvedValue({ id: 22, createdAt: publishedAt });
    await listApprovedComments(blog, 22);
    expect(db.publicComment.findFirst).toHaveBeenCalledWith({
      where: {
        id: 22,
        blogId: 7,
        parentId: null,
        publishedAt: { not: null },
        presentation: { not: "EDITORIAL" },
      },
      select: { id: true, createdAt: true },
    });
    expect(db.publicComment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ createdAt: { lt: publishedAt } }, { createdAt: publishedAt, id: { lt: 22 } }],
        }),
      })
    );
  });

  it("rejects a cursor outside the target top-level rows", async () => {
    db.publicComment.findFirst.mockResolvedValue(null);
    await expect(listApprovedComments(blog, 22)).rejects.toMatchObject({ status: 400 });
    expect(cacheTag).not.toHaveBeenCalled();
    expect(db.publicComment.findMany).not.toHaveBeenCalled();
  });

  it("checks target visibility before returning a cached page", async () => {
    db.blogs.findFirst.mockResolvedValue(null);
    await expect(listApprovedComments(blog)).rejects.toMatchObject({ status: 404 });
    expect(cacheTag).not.toHaveBeenCalled();
    expect(db.publicComment.findMany).not.toHaveBeenCalled();
  });
});
