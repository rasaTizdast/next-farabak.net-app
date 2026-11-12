import { getProductsByCategory, getProductsBySubcategory } from "@/lib/data/products";
import { getUsdToRialRate } from "@/lib/data/usd2rial";

import SimilarProductsSlider from "./SimilarProductsSlider";

type SimilarProductsProps = {
  currentProductId: number;
  currentProductSlug: string;
  categorySlug: string;
  subCategorySlug: string;
  limit?: number;
  title?: string;
};

type ApiProduct = {
  ProductId: number;
  Type: string;
  img1: string | null;
  productSlug: string;
  link: string;
  Available: boolean | null;
  Price: string | null;
  Discount: string | null;
};

async function fetchFeed(loader: () => Promise<{ data: unknown[] } | null>): Promise<ApiProduct[]> {
  try {
    const result = await loader();
    return ((result?.data || []) as ApiProduct[]).filter((p) => Boolean(p.Available));
  } catch {
    return [];
  }
}

export default async function SimilarProducts({
  currentProductId,
  currentProductSlug,
  categorySlug,
  subCategorySlug,
  limit = 8,
  title = "محصولات مشابه",
}: SimilarProductsProps) {
  const desiredCount = Math.max(1, Math.min(12, limit));

  const subData = await fetchFeed(() =>
    getProductsBySubcategory(subCategorySlug, { page: 1, limit: desiredCount })
  );
  let products: ApiProduct[] = subData;

  // Exclude the current product
  products = products.filter(
    (p) => p.ProductId !== currentProductId && p.productSlug !== currentProductSlug
  );

  if (products.length < desiredCount) {
    const catData = await fetchFeed(() =>
      getProductsByCategory(categorySlug, { page: 1, limit: desiredCount * 2 })
    );
    const catProducts = catData.filter(
      (p) =>
        Boolean(p.Available) &&
        p.ProductId !== currentProductId &&
        p.productSlug !== currentProductSlug
    );

    const seen = new Set(products.map((p) => p.ProductId));
    for (const p of catProducts) {
      if (seen.has(p.ProductId)) continue;
      products.push(p);
      seen.add(p.ProductId);
      if (products.length >= desiredCount) break;
    }
  }

  if (products.length === 0) return null;

  const { rate: usdRate } = await getUsdToRialRate();

  return (
    <section id="similar-products" className="mt-12">
      {(() => {
        const itemList = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: products.map((p, idx) => {
            const canonicalUrl = new URL(
              `/products/${p.link.replace(/^\/+/, "")}`,
              process.env.NEXT_PUBLIC_BASE_URL || "https://farabak.net"
            ).toString();

            return {
              "@type": "ListItem",
              position: idx + 1,
              name: p.Type?.trim() || p.productSlug,
              url: canonicalUrl,
            };
          }),
        } as const;
        return (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, "\\u003c") }}
          />
        );
      })()}
      <SimilarProductsSlider title={title} products={products} usdRate={usdRate ?? null} />
    </section>
  );
}
