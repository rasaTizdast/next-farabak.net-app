import { prisma } from "@/lib/prisma";

const PRODUCTS_PER_PAGE = 30;

export type ProductListingPageCheck =
  | { type: "all"; page: number }
  | { type: "category"; category: string; page: number }
  | { type: "subcategory"; subcategory: string; page: number };

export interface ProductDetailPageCheck {
  type: "product";
  category: string;
  subcategory: string;
  product: string;
  key: string | null;
}

export async function hasProductDetailPage(check: ProductDetailPageCheck): Promise<boolean> {
  if (!check.category || !check.subcategory || !check.product) return false;

  const [product, subcategory] = await Promise.all([
    prisma.product.findFirst({
      where: {
        Slug: {
          equals: check.product.toLowerCase(),
          mode: "insensitive",
        },
      },
      select: {
        ProductId: true,
        CategoryContentId: true,
        Available: true,
        QrCode_Key: true,
        QrCode_expiryDays: true,
        Category: { select: { Slug: true } },
      },
    }),
    prisma.categoryContent.findFirst({
      where: { Slug: check.subcategory },
      select: { CategoryContentId: true },
    }),
  ]);

  if (
    !product ||
    !subcategory ||
    product.Category?.Slug !== check.category ||
    !product.CategoryContentId ||
    (!product.Available && !product.QrCode_Key)
  ) {
    return false;
  }

  if (product.QrCode_Key) {
    if (!check.key || check.key !== product.QrCode_Key) return false;

    const expiryDate = new Date(product.QrCode_expiryDays as string);
    if (new Date() > expiryDate) return false;
  }

  return product.CategoryContentId.split(",").some(
    (id) => id.trim() === String(subcategory.CategoryContentId)
  );
}

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
