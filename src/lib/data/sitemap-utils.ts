export interface SitemapProductPath {
  Slug: string | null;
  CategoryContentId: string | null;
  Category: { CategoryID: number } | null;
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
        [subcategory.CategoryContentId, { categoryId: subcategory.CategoryID, slug }] as const,
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

    const primaryId = product.CategoryContentId.split(",")
      .map((id) => Number.parseInt(id.trim(), 10))
      .find((id) => Number.isSafeInteger(id) && id > 0);
    const subcategory = primaryId === undefined ? undefined : subcategoryPaths.get(primaryId);
    if (subcategory?.categoryId !== categoryId) return [];

    return [`https://farabak.net/products/${categorySlug}/${subcategory.slug}/${productSlug}`];
  });
}
