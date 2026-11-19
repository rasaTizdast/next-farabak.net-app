import { prisma } from "@/lib/prisma";

import { selectCanonicalProductSlug } from "./product-slug";

const PRODUCTS_PER_PAGE = 30;

export type ProductListingPageCheck =
  | { type: "all"; page: number }
  | { type: "category"; category: string; page: number }
  | { type: "subcategory"; category: string; subcategory: string; page: number };

export interface ProductDetailPageCheck {
  type: "product";
  category: string;
  subcategory: string;
  product: string;
  key: string | null;
}

export interface ProductDetailPageResolution {
  canonicalPath: string;
  shouldRedirect: boolean;
}

export async function resolveProductDetailPage(
  check: ProductDetailPageCheck
): Promise<ProductDetailPageResolution | null> {
  if (!check.category || !check.subcategory || !check.product) return null;

  const products = await prisma.product.findMany({
    where: {
      Slug: {
        equals: check.product,
        mode: "insensitive",
      },
    },
    select: {
      ProductId: true,
      Slug: true,
      CategoryContentId: true,
      Available: true,
      QrCode_Key: true,
      QrCode_expiryDays: true,
      CategoryId: true,
      Category: { select: { Slug: true } },
    },
  });
  const product = selectCanonicalProductSlug(products, check.product);

  if (
    !product ||
    !product.Slug ||
    product.Category?.Slug !== check.category ||
    !product.CategoryContentId
  ) {
    return null;
  }

  const categoryContentIds = product.CategoryContentId.split(",")
    .map((id) => Number.parseInt(id.trim(), 10))
    .filter((id) => Number.isSafeInteger(id) && id > 0);
  const primaryCategoryContentId = categoryContentIds[0];
  if (!primaryCategoryContentId || !product.CategoryId) return null;

  const subcategories = await prisma.categoryContent.findMany({
    where: { CategoryContentId: { in: categoryContentIds } },
    select: { CategoryContentId: true, Slug: true, CategoryID: true },
  });
  const requestedSubcategory = subcategories.find(
    (subcategory) =>
      subcategory.Slug === check.subcategory && subcategory.CategoryID === product.CategoryId
  );
  const primarySubcategory = subcategories.find(
    (subcategory) =>
      subcategory.CategoryContentId === primaryCategoryContentId &&
      subcategory.CategoryID === product.CategoryId &&
      subcategory.Slug
  );
  if (!requestedSubcategory || !primarySubcategory?.Slug) return null;

  if (!product.Available && !product.QrCode_Key) return null;

  if (product.QrCode_Key) {
    if (!check.key || check.key !== product.QrCode_Key) return null;

    const expiryDate = new Date(product.QrCode_expiryDays as string);
    if (Number.isNaN(expiryDate.getTime()) || new Date() > expiryDate) return null;
  }

  const canonicalPath = `/products/${encodeURIComponent(check.category)}/${encodeURIComponent(
    primarySubcategory.Slug
  )}/${encodeURIComponent(product.Slug || "")}`;
  const requestedPath = `/products/${encodeURIComponent(check.category)}/${encodeURIComponent(
    check.subcategory
  )}/${encodeURIComponent(check.product)}`;

  return {
    canonicalPath,
    shouldRedirect: !product.QrCode_Key && canonicalPath !== requestedPath,
  };
}

export async function hasProductDetailPage(check: ProductDetailPageCheck): Promise<boolean> {
  return (await resolveProductDetailPage(check)) !== null;
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
    const category = await prisma.category.findFirst({
      where: { Slug: check.category },
      select: { CategoryID: true },
    });
    if (!category) return false;

    const subcategory = await prisma.categoryContent.findFirst({
      where: { Slug: check.subcategory },
      select: { CategoryContentId: true, CategoryID: true },
    });
    if (!subcategory || subcategory.CategoryID !== category.CategoryID) return false;

    const subcategoryId = String(subcategory.CategoryContentId);
    totalCount = await prisma.product.count({
      where: {
        CategoryId: category.CategoryID,
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
