import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import ProductGridWrapper from "./ProductGridWrapper";

vi.mock("./ProductGrid", () => ({ default: () => null }));

const pageVariants = [
  {
    name: "category root",
    props: {
      categorySlug: "x-ray",
      canonicalUrl: "https://farabak.net/products/x-ray",
    },
    expectedUrl: "https://farabak.net/products/x-ray",
  },
  {
    name: "category page two",
    props: {
      categorySlug: "x-ray",
      currentPage: 2,
      canonicalUrl: "https://farabak.net/products/x-ray/page/2",
    },
    expectedUrl: "https://farabak.net/products/x-ray/page/2",
  },
  {
    name: "subcategory root",
    props: {
      categorySlug: "x-ray",
      subcategorySlug: "airport-luggage",
      canonicalUrl: "https://farabak.net/products/x-ray/airport-luggage",
    },
    expectedUrl: "https://farabak.net/products/x-ray/airport-luggage",
  },
  {
    name: "subcategory page two",
    props: {
      categorySlug: "x-ray",
      subcategorySlug: "airport-luggage",
      currentPage: 2,
      canonicalUrl: "https://farabak.net/products/x-ray/airport-luggage/page/2",
    },
    expectedUrl: "https://farabak.net/products/x-ray/airport-luggage/page/2",
  },
];

describe("ProductGridWrapper JSON-LD HTML", () => {
  it.each(pageVariants)("renders one SSR collection script for $name", ({ props, expectedUrl }) => {
    const html = renderToStaticMarkup(
      <ProductGridWrapper
        title="محصولات ایکس‌ری"
        apiUrl="https://farabak.net/api/products/getProductsByCategory/x-ray?page=1&limit=30"
        currentPage={1}
        collectionItems={[{ name: "Smiths Detection HI-SCAN", path: "x-ray/airport/hi-scan" }]}
        {...props}
      />
    );
    const scripts = html.match(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g
    );

    expect(scripts).toHaveLength(1);

    const scriptContent = scripts?.[0]?.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    const schema = JSON.parse(scriptContent || "null");
    expect(schema).toMatchObject({
      "@type": "CollectionPage",
      url: expectedUrl,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          {
            name: "Smiths Detection HI-SCAN",
            url: "https://farabak.net/products/x-ray/airport/hi-scan",
          },
        ],
      },
    });
  });
});
