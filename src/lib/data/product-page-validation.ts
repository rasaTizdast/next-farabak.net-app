import { prisma } from "@/lib/prisma";

const PRODUCTS_PER_PAGE = 30;

export type ProductListingPageCheck =
  | { type: "all"; page: number }
  | { type: "category"; category: string; page: number }
  | { type: "subcategory"; subcategory: string; page: number };

export async function hasProductListingPage(check: ProductListingPageCheck): Promise<boolean> {
  if (!Number.isSafeInteger(check.page) || check.page < 1) return false;

  let totalCount: number;

  if (check.type === "all") {
    totalCount = await prisma.product.count({ where: { CategoryId: { not: null } } });
  } else if (check.type === "category") {
    const category = await prisma.category.findFirst({
      where: { Slug: check.category },
      select: { CategoryID: true },
    });
    if (!category) return false;

    totalCount = await prisma.product.count({ where: { CategoryId: category.CategoryID } });
  } else {
    const subcategory = await prisma.categoryContent.findFirst({
      where: { Slug: check.subcategory },
      select: { CategoryContentId: true },
    });
    if (!subcategory) return false;

    const subcategoryId = String(subcategory.CategoryContentId);
    totalCount = await prisma.product.count({
      where: {
        CategoryId: { not: null },
        OR: [
          { CategoryContentId: { equals: subcategoryId } },
          { CategoryContentId: { startsWith: `${subcategoryId},` } },
          { CategoryContentId: { endsWith: `,${subcategoryId}` } },
          { CategoryContentId: { contains: `,${subcategoryId},` } },
        ],
      },
    });
  }

  return totalCount > 0 && Math.ceil(totalCount / PRODUCTS_PER_PAGE) >= check.page;
}
