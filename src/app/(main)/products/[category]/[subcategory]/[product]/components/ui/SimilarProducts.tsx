import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";

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

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
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

  const subQs = new URLSearchParams({ page: "1", limit: String(desiredCount) }).toString();
  const subUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsBySubcategory/${encodeURIComponent(
    subCategorySlug
  )}?${subQs}`;

  const catQs = new URLSearchParams({ page: "1", limit: String(desiredCount * 2) }).toString();
  const catUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsByCategory/${encodeURIComponent(
    categorySlug
  )}?${catQs}`;

  const subData = await fetchJson<{ data: ApiProduct[] }>(subUrl);
  let products: ApiProduct[] = (subData?.data || []).filter((p) => Boolean(p.Available));

  // Exclude the current product
  products = products.filter(
    (p) => p.ProductId !== currentProductId && p.productSlug !== currentProductSlug
  );

  if (products.length < desiredCount) {
    const catData = await fetchJson<{ data: ApiProduct[] }>(catUrl);
    const catProducts = (catData?.data || [])
      .filter((p) => Boolean(p.Available))
      .filter((p) => p.ProductId !== currentProductId && p.productSlug !== currentProductSlug);

    const seen = new Set(products.map((p) => p.ProductId));
    for (const p of catProducts) {
      if (seen.has(p.ProductId)) continue;
      products.push(p);
      seen.add(p.ProductId);
      if (products.length >= desiredCount) break;
    }
  }

  if (products.length === 0) return null;

  const usdRate = await fetchUsdToRialRate();

  return (
    <section id="similar-products" className="mt-12">
      {(() => {
        const priceValidUntil = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
        const itemList = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: products.map((p, idx) => {
            const rawPrice = Number(p.Price);
            const rawDiscount = Number(p.Discount);
            const hasValidPrice = Number.isFinite(rawPrice) && rawPrice > 0;
            const hasValidDiscount =
              Number.isFinite(rawDiscount) && rawDiscount > 0 && rawDiscount < rawPrice;
            const finalPrice = hasValidDiscount ? rawPrice - rawDiscount : rawPrice;

            return {
              "@type": "ListItem",
              position: idx + 1,
              item: {
                "@type": "Product",
                name: p.Type,
                url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${p.link}`,
                image: `${process.env.LIARA_BUCKET_URL}/productImages/${p.img1}`,
                sku: `FAR-${p.ProductId}`,
                offers: {
                  "@type": "Offer",
                  price: String(hasValidPrice ? finalPrice : 0),
                  priceCurrency: "IRR",
                  priceValidUntil,
                  availability: p.Available
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                  url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${p.link}`,
                },
              },
            };
          }),
        } as const;
        return (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
          />
        );
      })()}
      <SimilarProductsSlider title={title} products={products} usdRate={usdRate ?? null} />
    </section>
  );
}
