import { cacheLife, cacheTag } from "next/cache";

import { advisorCategoryDefinitions } from "@/features/product-advisor/category-definitions";
import { normalizeAdvisorSpecs } from "@/features/product-advisor/normalizers";
import type { AdvisorProductSnapshot } from "@/features/product-advisor/types";
import { prisma } from "@/lib/prisma";

import { TAGS } from "./tags";

export interface AdvisorCategoryData {
  category: { name: string; slug: string };
  products: AdvisorProductSnapshot[];
}

function productImageUrl(value: string | null) {
  if (!value) return null;
  if (value.startsWith("http") || value.startsWith("/")) return value;

  const bucketUrl = process.env.LIARA_BUCKET_URL || process.env.NEXT_PUBLIC_LIARA_BUCKET_URL;
  return bucketUrl ? `${bucketUrl}/productImages/${value}` : null;
}

function subcategorySlug(categoryContentId: string | null, slugs: Map<number, string>) {
  const firstId = categoryContentId?.split(",").find(Boolean);
  return firstId ? (slugs.get(Number(firstId)) ?? null) : null;
}

export async function getAdvisorCategory(slug: string): Promise<AdvisorCategoryData | null> {
  "use cache";
  cacheTag(TAGS.products);
  cacheTag(TAGS.categories);
  cacheTag(TAGS.productSpecs);
  cacheLife("minutes");

  const definition = advisorCategoryDefinitions[slug];
  if (!definition) return null;

  const category = await prisma.category.findFirst({
    where: { Available: true, Slug: slug },
    select: { CategoryID: true, Name: true, Slug: true },
  });
  if (!category?.Name || !category.Slug) return null;
  const categorySlug = category.Slug;

  const [subcategories, products] = await Promise.all([
    prisma.categoryContent.findMany({
      where: { Available: true, CategoryID: category.CategoryID },
      select: { CategoryContentId: true, Slug: true },
    }),
    prisma.product.findMany({
      where: { Available: true, CategoryId: category.CategoryID },
      select: {
        ProductId: true,
        Name: true,
        Type: true,
        img1: true,
        Slug: true,
        CategoryContentId: true,
      },
    }),
  ]);

  const productIds = products.map((product) => product.ProductId);
  const specs = productIds.length
    ? await prisma.productSpecs.findMany({
        where: { Available: true, ProductId: { in: productIds } },
        select: { ProductId: true, Name: true, Title: true, Description: true },
      })
    : [];
  const subcategorySlugs = new Map(
    subcategories.flatMap((subcategory) =>
      subcategory.Slug ? [[subcategory.CategoryContentId, subcategory.Slug] as const] : []
    )
  );

  const specsByProduct = new Map<number, typeof specs>();
  for (const spec of specs) {
    if (spec.ProductId === null) continue;
    const productSpecs = specsByProduct.get(spec.ProductId) ?? [];
    productSpecs.push(spec);
    specsByProduct.set(spec.ProductId, productSpecs);
  }

  return {
    category: { name: category.Name, slug: categorySlug },
    products: products.flatMap((product) => {
      if (!product.Slug) return [];
      const subcategory = subcategorySlug(product.CategoryContentId, subcategorySlugs);
      const detailHref = subcategory
        ? `/products/${categorySlug}/${subcategory}/${product.Slug}`
        : `/products/${categorySlug}`;

      return [
        {
          productId: product.ProductId,
          categorySlug,
          subcategorySlug: subcategory,
          name: product.Name?.trim() || product.Type?.trim() || "محصول فرابک",
          model: product.Type?.trim() || null,
          imageUrl: productImageUrl(product.img1),
          detailHref,
          specs: normalizeAdvisorSpecs(
            specsByProduct.get(product.ProductId) ?? [],
            definition.normalizers
          ),
        },
      ];
    }),
  };
}
