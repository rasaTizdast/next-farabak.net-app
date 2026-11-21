/** Public sitemap paths are the build-time catalog snapshot; QR-only pages stay request-time. */
export async function getCatalogStaticParams() {
  const { getSitemapUrls } = await import("./sitemap");
  const { urls } = await getSitemapUrls();
  const categories: { category: string }[] = [];
  const subcategories: { category: string; subcategory: string }[] = [];
  const products: { category: string; subcategory: string; product: string }[] = [];

  for (const url of new Set(urls)) {
    let segments: string[];
    try {
      const parsed = new URL(url);
      if (
        parsed.origin !== "https://farabak.net" ||
        !parsed.pathname.startsWith("/products/") ||
        parsed.search ||
        parsed.hash
      )
        continue;
      segments = parsed.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    } catch {
      // An invalid stored URL must not prevent unrelated public products from building.
      continue;
    }
    const [root, category, subcategory, product, extra] = segments;
    if (root !== "products" || !category || category === "page" || extra) continue;
    if (!subcategory) categories.push({ category });
    else if (!product) subcategories.push({ category, subcategory });
    else products.push({ category, subcategory, product });
  }

  return { categories, subcategories, products };
}
