import { beforeEach, describe, expect, it, vi } from "vitest";

import { listAdminComments } from "./admin-queries";

const db = vi.hoisted(() => ({
  client: { findUnique: vi.fn() },
  publicComment: { findFirst: vi.fn(), findMany: vi.fn() },
  categoryContent: { findMany: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: db }));

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation(async (read) => read(db));
  db.client.findUnique.mockResolvedValue({ Role: "Admin" });
  db.publicComment.findFirst.mockResolvedValue({
    id: 30,
    createdAt: new Date("2026-11-23T10:00:00.000Z"),
  });
  db.publicComment.findMany.mockResolvedValue([
    {
      id: 32,
      blogId: 7,
      productId: null,
      parentId: 30,
      actorId: 18,
      displayName: "نام مستعار",
      presentation: "ALIAS",
      body: "متن دیدگاه",
      status: "PENDING",
      createdAt: new Date("2026-11-23T10:00:00.000Z"),
      publishedAt: null,
      reviewerId: null,
      reviewedAt: null,
      reviewNote: null,
      parent: { id: 30, displayName: "علی رضایی", body: "دیدگاه والد", status: "APPROVED" },
      blog: {
        title: "راهنمای خرید",
        slug: "buying-guide",
        BlogCategories: [{ Categories: { slug: "guides" } }],
      },
      product: null,
    },
  ]);
  db.categoryContent.findMany.mockResolvedValue([]);
});

describe("listAdminComments", () => {
  it("rechecks the current administrator role and returns review context plus a valid blog link", async () => {
    const page = await listAdminComments(18, { status: "PENDING", targetType: "blog" });

    expect(db.client.findUnique).toHaveBeenCalledWith({
      where: { UserID: 18 },
      select: { Role: true },
    });
    expect(db.publicComment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PENDING", blogId: { not: null } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 21,
      })
    );
    expect(page.comments[0]).toMatchObject({
      id: 32,
      author: { actorId: 18, displayName: "نام مستعار", presentation: "ALIAS" },
      parent: { id: 30, displayName: "علی رضایی", status: "APPROVED" },
      target: {
        type: "blog",
        id: 7,
        label: "راهنمای خرید",
        href: "/support/blog/guides/buying-guide",
      },
      status: "PENDING",
      reviewNote: null,
    });
    expect(page.comments[0].createdAt).toBe("2026-11-23T10:00:00.000Z");
    expect(page.nextCursor).toBeNull();
  });

  it("rejects a stale Admin role before reading the queue", async () => {
    db.client.findUnique.mockResolvedValue({ Role: "Public" });
    await expect(listAdminComments(18, {})).rejects.toMatchObject({ status: 403 });
    expect(db.publicComment.findMany).not.toHaveBeenCalled();
  });

  it("rejects a missing account and invalid cursors", async () => {
    db.client.findUnique.mockResolvedValue(null);
    await expect(listAdminComments(18, {})).rejects.toMatchObject({ status: 401 });
    db.client.findUnique.mockResolvedValue({ Role: "Admin" });
    db.publicComment.findFirst.mockResolvedValue(null);
    await expect(listAdminComments(18, { cursor: 900 })).rejects.toMatchObject({ status: 400 });
    expect(db.publicComment.findMany).not.toHaveBeenCalled();
  });

  it("keeps paging when the anchor status changes", async () => {
    await listAdminComments(18, { status: "PENDING", targetType: "blog", cursor: 30 });
    expect(db.publicComment.findFirst).toHaveBeenCalledWith({
      where: { id: 30, blogId: { not: null } },
      select: { id: true, createdAt: true },
    });
    expect(db.publicComment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { createdAt: { lt: new Date("2026-11-23T10:00:00.000Z") } },
            { createdAt: new Date("2026-11-23T10:00:00.000Z"), id: { lt: 30 } },
          ],
        }),
      })
    );
  });

  it("uses a deterministic lookahead cursor on filtered admin results", async () => {
    db.publicComment.findMany.mockResolvedValue(
      Array.from({ length: 21 }, (_, index) => ({
        id: 90 - index,
        blogId: 7,
        productId: null,
        parentId: null,
        actorId: null,
        displayName: "کاربر پیشین",
        presentation: "LEGACY",
        body: "متن قدیمی",
        status: "REJECTED",
        createdAt: new Date("2026-11-23T10:00:00.000Z"),
        publishedAt: null,
        reviewerId: 18,
        reviewedAt: new Date("2026-11-23T11:00:00.000Z"),
        reviewNote: "نیازمند بررسی",
        parent: null,
        blog: { title: "راهنما", slug: "guide", BlogCategories: [] },
        product: null,
      }))
    );
    const page = await listAdminComments(18, { status: "REJECTED", targetType: "blog" });

    expect(page.comments).toHaveLength(20);
    expect(page.nextCursor).toBe(71);
  });

  it("builds a canonical product link from the primary category and subcategory", async () => {
    db.publicComment.findMany.mockResolvedValueOnce([
      {
        id: 44,
        blogId: null,
        productId: 9,
        actorId: 18,
        displayName: "علی رضایی",
        presentation: "MEMBER",
        body: "متن دیدگاه محصول",
        status: "PENDING",
        createdAt: new Date("2026-11-23T12:00:00.000Z"),
        publishedAt: null,
        reviewerId: null,
        reviewedAt: null,
        reviewNote: null,
        parent: null,
        blog: null,
        product: {
          Name: "دوربین B400",
          Slug: "B400",
          CategoryId: 4,
          CategoryContentId: "12,15",
          Category: { Slug: "camera" },
        },
      },
    ]);
    db.categoryContent.findMany.mockResolvedValueOnce([
      { CategoryContentId: 12, CategoryID: 4, Slug: "bullet" },
    ]);

    const page = await listAdminComments(18, { targetType: "product" });

    expect(page.comments[0].target).toEqual({
      type: "product",
      id: 9,
      label: "دوربین B400",
      href: "/products/camera/bullet/B400",
    });
  });

  it("rejects malformed IDs and unsupported filters", async () => {
    await expect(listAdminComments(0, {})).rejects.toMatchObject({ status: 400 });
    await expect(listAdminComments(18, { status: "OTHER" } as never)).rejects.toMatchObject({
      status: 400,
    });
    expect(db.client.findUnique).not.toHaveBeenCalled();
  });
});
