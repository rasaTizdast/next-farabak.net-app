import { describe, expect, it } from "vitest";

import { serializeJsonLd } from "@/lib/seo/json-ld";

import { buildProductCollectionSchema } from "./product-collection-schema";

describe("product collection structured data", () => {
  it("describes the collection and only the provided real product names and URLs", () => {
    const schema = buildProductCollectionSchema({
      title: "Blackmagic Design | فرابک",
      canonicalUrl: "https://farabak.net/products/blackmagic",
      products: [
        { name: "Blackmagic PYXIS 12K", path: "blackmagic/camera/pyxis-12k" },
        { name: "ATEM Television Studio HD8", path: "blackmagic/switcher/atem-hd8" },
      ],
    });

    expect(schema).toMatchObject({
      "@type": "CollectionPage",
      url: "https://farabak.net/products/blackmagic",
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: 2,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Blackmagic PYXIS 12K",
            url: "https://farabak.net/products/blackmagic/camera/pyxis-12k",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "ATEM Television Studio HD8",
            url: "https://farabak.net/products/blackmagic/switcher/atem-hd8",
          },
        ],
      },
    });
    expect(schema).not.toHaveProperty("breadcrumb");

    const serialized = JSON.stringify(schema);
    expect(serialized).not.toMatch(
      /"(?:Product|Offer|price|lowPrice|highPrice|availability|shipping|shippingRate|deliveryTime|hasMerchantReturnPolicy)"|InStock|return policy/i
    );
    expect(serialized).not.toMatch(/CCTV|مداربسته|سیستم‌های نظارتی|محصولات امنیتی/i);
  });

  it("omits products with missing names or canonical product paths", () => {
    const schema = buildProductCollectionSchema({
      title: "محصولات ایکس‌ری | فرابک",
      canonicalUrl: "/products/x-ray",
      products: [
        { name: "", path: "x-ray/airport/ctx-5800" },
        { name: "مدل بدون مسیر کامل", path: "x-ray//broken" },
        { name: "مدل با مسیر کامل", path: "x-ray/airport/ctx-5800" },
        { name: "مدل با میزبان خارجی", path: "https://other.example/x-ray/airport/item" },
      ],
    });

    expect(schema?.mainEntity.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "مدل با مسیر کامل",
        url: "https://farabak.net/products/x-ray/airport/ctx-5800",
      },
    ]);
  });

  it("escapes script-breaking characters while keeping valid JSON", () => {
    const schema = buildProductCollectionSchema({
      title: "X-ray </script><script>alert(1)</script>",
      canonicalUrl: "https://farabak.net/products/x-ray",
      products: [{ name: "Model </script>", path: "x-ray/airport/model" }],
    });
    const serialized = serializeJsonLd(schema);

    expect(serialized).not.toContain("</script>");
    expect(JSON.parse(serialized)).toEqual(schema);
  });
});
