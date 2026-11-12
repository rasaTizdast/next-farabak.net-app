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
      breadcrumbCategoryTitle: "ایکس‌ری",
    },
    expectedUrl: "https://farabak.net/products/x-ray",
    expectedBreadcrumbs: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://farabak.net/" },
      { "@type": "ListItem", position: 2, name: "محصولات", item: "https://farabak.net/products" },
      {
        "@type": "ListItem",
        position: 3,
        name: "ایکس‌ری",
        item: "https://farabak.net/products/x-ray",
      },
    ],
  },
  {
    name: "category page two",
    props: {
      categorySlug: "x-ray",
      currentPage: 2,
      canonicalUrl: "https://farabak.net/products/x-ray/page/2",
      breadcrumbCategoryTitle: "ایکس‌ری",
    },
    expectedUrl: "https://farabak.net/products/x-ray/page/2",
    expectedBreadcrumbs: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://farabak.net/" },
      { "@type": "ListItem", position: 2, name: "محصولات", item: "https://farabak.net/products" },
      {
        "@type": "ListItem",
        position: 3,
        name: "ایکس‌ری",
        item: "https://farabak.net/products/x-ray",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "صفحه 2",
        item: "https://farabak.net/products/x-ray/page/2",
      },
    ],
  },
  {
    name: "subcategory root",
    props: {
      categorySlug: "x-ray",
      subcategorySlug: "airport-luggage",
      canonicalUrl: "https://farabak.net/products/x-ray/airport-luggage",
      breadcrumbCategoryTitle: "ایکس‌ری",
      breadcrumbSubcategoryTitle: "بار فرودگاهی",
    },
    expectedUrl: "https://farabak.net/products/x-ray/airport-luggage",
    expectedBreadcrumbs: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://farabak.net/" },
      { "@type": "ListItem", position: 2, name: "محصولات", item: "https://farabak.net/products" },
      {
        "@type": "ListItem",
        position: 3,
        name: "ایکس‌ری",
        item: "https://farabak.net/products/x-ray",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "بار فرودگاهی",
        item: "https://farabak.net/products/x-ray/airport-luggage",
      },
    ],
  },
  {
    name: "subcategory page two",
    props: {
      categorySlug: "x-ray",
      subcategorySlug: "airport-luggage",
      currentPage: 2,
      canonicalUrl: "https://farabak.net/products/x-ray/airport-luggage/page/2",
      breadcrumbCategoryTitle: "ایکس‌ری",
      breadcrumbSubcategoryTitle: "بار فرودگاهی",
    },
    expectedUrl: "https://farabak.net/products/x-ray/airport-luggage/page/2",
    expectedBreadcrumbs: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://farabak.net/" },
      { "@type": "ListItem", position: 2, name: "محصولات", item: "https://farabak.net/products" },
      {
        "@type": "ListItem",
        position: 3,
        name: "ایکس‌ری",
        item: "https://farabak.net/products/x-ray",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "بار فرودگاهی",
        item: "https://farabak.net/products/x-ray/airport-luggage",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "صفحه 2",
        item: "https://farabak.net/products/x-ray/airport-luggage/page/2",
      },
    ],
  },
];

describe("ProductGridWrapper JSON-LD HTML", () => {
  it("does not invent collection items when page data was not provided", () => {
    const html = renderToStaticMarkup(
      <ProductGridWrapper
        title="نتایج جستجو"
        apiUrl="https://farabak.net/api/products/search?q=test&page=1&limit=30"
        currentPage={1}
      />
    );

    expect(html).not.toContain('type="application/ld+json"');
    expect(html).not.toContain("30+");
  });

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
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: expectedBreadcrumbs,
      },
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
