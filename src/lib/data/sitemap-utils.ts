export interface SitemapProductPath {
  Slug: string | null;
  CategoryContentId: string | null;
  Category: { CategoryID: number; Slug: string | null } | null;
}

export interface SitemapCategoryPath {
  CategoryID: number;
  Slug: string | null;
}

export interface SitemapSubcategoryPath {
  CategoryContentId: number;
  CategoryID: number | null;
  Slug: string | null;
  Category: { Slug: string | null } | null;
}

export function buildProductSitemapUrls(
  products: SitemapProductPath[],
  categories: SitemapCategoryPath[],
  subcategories: SitemapSubcategoryPath[]
): string[] {
  const categorySlugs = new Map(
    categories.flatMap((category) =>
      category.Slug?.trim() ? [[category.CategoryID, category.Slug.trim()] as const] : []
    )
  );
  const subcategoryPaths = new Map(
    subcategories.flatMap((subcategory) => {
      const categorySlug = subcategory.Category?.Slug?.trim();
      const slug = subcategory.Slug?.trim();
      if (
        subcategory.CategoryID === null ||
        !categorySlug ||
        !slug ||
        categorySlugs.get(subcategory.CategoryID) !== categorySlug
      ) {
        return [];
      }

      return [
        [
          subcategory.CategoryContentId,
          { categoryId: subcategory.CategoryID, categorySlug, slug },
        ] as const,
      ];
    })
  );

  return products.flatMap((product) => {
    const productSlug = product.Slug?.trim();
    const categoryId = product.Category?.CategoryID;
    const categorySlug = categoryId === undefined ? undefined : categorySlugs.get(categoryId);
    if (!productSlug || categoryId === undefined || !categorySlug || !product.CategoryContentId) {
      return [];
    }

    for (const rawId of product.CategoryContentId.split(",")) {
      const categoryContentId = Number.parseInt(rawId.trim(), 10);
      if (!Number.isInteger(categoryContentId) || categoryContentId <= 0) continue;

      const subcategory = subcategoryPaths.get(categoryContentId);
      if (subcategory?.categoryId === categoryId && subcategory.categorySlug === categorySlug) {
        return [`https://farabak.net/products/${categorySlug}/${subcategory.slug}/${productSlug}`];
      }
    }

    return [];
  });
}
