import { CommentStatus, Prisma, type CommentPresentation } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

import { CommentError } from "./types";
import { commentIdSchema } from "./validation";

const pageSize = 20;

const adminCommentFiltersSchema = z.strictObject({
  status: z.enum(CommentStatus).optional(),
  targetType: z.enum(["blog", "product"]).optional(),
  cursor: commentIdSchema.optional(),
});

export type AdminCommentFilters = z.infer<typeof adminCommentFiltersSchema>;

export type AdminCommentItem = {
  id: number;
  target: {
    type: "blog" | "product";
    id: number;
    label: string;
    href: string | null;
  };
  author: {
    actorId: number | null;
    displayName: string;
    presentation: CommentPresentation;
  };
  body: string;
  status: CommentStatus;
  createdAt: string;
  publishedAt: string | null;
  reviewerId: number | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  parent: { id: number; displayName: string; body: string; status: CommentStatus } | null;
};

export type AdminCommentPage = {
  comments: AdminCommentItem[];
  nextCursor: number | null;
};

type ProductCategorySlug = {
  CategoryContentId: number;
  CategoryID: number | null;
  Slug: string | null;
};

function adminWhere(filters: AdminCommentFilters): Prisma.PublicCommentWhereInput {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.targetType === "blog" ? { blogId: { not: null } } : {}),
    ...(filters.targetType === "product" ? { productId: { not: null } } : {}),
  };
}

function hrefForBlog(row: {
  slug: string;
  BlogCategories: Array<{ Categories: { slug: string | null } }>;
}): string | null {
  const categorySlug = row.BlogCategories[0]?.Categories.slug;
  return categorySlug
    ? `/support/blog/${encodeURIComponent(categorySlug)}/${encodeURIComponent(row.slug)}`
    : null;
}

function hrefForProduct(
  row: {
    Slug: string | null;
    CategoryContentId: string | null;
    CategoryId: number | null;
    Category: { Slug: string | null } | null;
  },
  subcategories: Map<number, ProductCategorySlug>
): string | null {
  if (!row.Slug || !row.CategoryId || !row.Category?.Slug || !row.CategoryContentId) return null;

  const firstSubcategoryId = Number(row.CategoryContentId.split(",")[0]?.trim());
  const subcategory = subcategories.get(firstSubcategoryId);
  if (!subcategory?.Slug || subcategory.CategoryID !== row.CategoryId) return null;

  return `/products/${encodeURIComponent(row.Category.Slug)}/${encodeURIComponent(
    subcategory.Slug
  )}/${encodeURIComponent(row.Slug)}`;
}

export async function listAdminComments(
  actorId: number,
  filters: AdminCommentFilters
): Promise<AdminCommentPage> {
  const parsedActor = commentIdSchema.safeParse(actorId);
  const parsedFilters = adminCommentFiltersSchema.safeParse(filters);
  if (!parsedActor.success || !parsedFilters.success) {
    throw new CommentError(400, "INVALID_FILTER", "The admin comment filters are invalid.");
  }

  const where = adminWhere(parsedFilters.data);
  const { rows, subcategoryRows } = await prisma.$transaction(
    async (db) => {
      const actor = await db.client.findUnique({
        where: { UserID: parsedActor.data },
        select: { Role: true },
      });
      if (!actor) throw new CommentError(401, "ACCOUNT_NOT_FOUND", "Sign in to continue.");
      if (actor.Role !== "Admin") {
        throw new CommentError(403, "ADMIN_REQUIRED", "This action requires an administrator.");
      }

      let anchor: { id: number; createdAt: Date } | null = null;
      if (parsedFilters.data.cursor !== undefined) {
        anchor = await db.publicComment.findFirst({
          where: {
            ...adminWhere({ targetType: parsedFilters.data.targetType }),
            id: parsedFilters.data.cursor,
          },
          select: { id: true, createdAt: true },
        });
        if (!anchor) {
          throw new CommentError(400, "INVALID_CURSOR", "The comment page cursor is invalid.");
        }
      }

      const rows = await db.publicComment.findMany({
        where: {
          ...where,
          ...(anchor
            ? {
                OR: [
                  { createdAt: { lt: anchor.createdAt } },
                  { createdAt: anchor.createdAt, id: { lt: anchor.id } },
                ],
              }
            : {}),
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: pageSize + 1,
        select: {
          id: true,
          blogId: true,
          productId: true,
          actorId: true,
          displayName: true,
          presentation: true,
          body: true,
          status: true,
          createdAt: true,
          publishedAt: true,
          reviewerId: true,
          reviewedAt: true,
          reviewNote: true,
          parent: {
            select: { id: true, displayName: true, body: true, status: true },
          },
          blog: {
            select: {
              title: true,
              slug: true,
              BlogCategories: {
                orderBy: { category_id: "asc" },
                take: 1,
                select: { Categories: { select: { slug: true } } },
              },
            },
          },
          product: {
            select: {
              Name: true,
              Slug: true,
              CategoryId: true,
              CategoryContentId: true,
              Category: { select: { Slug: true } },
            },
          },
        },
      });

      const subcategoryIds = rows.flatMap((row) => {
        if (!row.product?.CategoryContentId) return [];
        const id = Number(row.product.CategoryContentId.split(",")[0]?.trim());
        return Number.isSafeInteger(id) && id > 0 ? [id] : [];
      });
      const subcategoryRows = subcategoryIds.length
        ? await db.categoryContent.findMany({
            where: { CategoryContentId: { in: [...new Set(subcategoryIds)] } },
            select: { CategoryContentId: true, CategoryID: true, Slug: true },
          })
        : [];

      return { rows, subcategoryRows };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead }
  );

  const subcategories = new Map(
    subcategoryRows.map((row) => [row.CategoryContentId, row as ProductCategorySlug])
  );
  const comments = rows.slice(0, pageSize).map((row): AdminCommentItem => {
    const blog = row.blog;
    const product = row.product;
    const targetId = row.blogId ?? row.productId!;
    const targetType = row.blogId !== null ? "blog" : "product";
    return {
      id: row.id,
      target: {
        type: targetType,
        id: targetId,
        label: blog?.title ?? product?.Name ?? `محصول ${targetId}`,
        href: blog ? hrefForBlog(blog) : product ? hrefForProduct(product, subcategories) : null,
      },
      author: {
        actorId: row.actorId,
        displayName: row.displayName,
        presentation: row.presentation,
      },
      body: row.body,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      publishedAt: row.publishedAt?.toISOString() ?? null,
      reviewerId: row.reviewerId,
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      reviewNote: row.reviewNote,
      parent: row.parent,
    };
  });

  return {
    comments,
    nextCursor: rows.length > pageSize ? comments[pageSize - 1].id : null,
  };
}
