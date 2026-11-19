export interface ProductSlugCandidate {
  ProductId: number;
  Slug: string | null;
}

export function selectCanonicalProductSlug<T extends ProductSlugCandidate>(
  products: T[],
  requestedSlug: string
): T | null {
  const exactMatches = products.filter((product) => product.Slug === requestedSlug);
  if (exactMatches.length === 1) return exactMatches[0];
  if (exactMatches.length > 1) return null;

  const productsById = new Map(products.map((product) => [product.ProductId, product]));
  return productsById.size === 1 ? productsById.values().next().value || null : null;
}
