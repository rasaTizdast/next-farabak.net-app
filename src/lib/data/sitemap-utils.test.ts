import { describe, expect, it } from "vitest";

import { buildProductSitemapUrls } from "./sitemap-utils";

describe("buildProductSitemapUrls", () => {
  it("emits only complete product paths using the first valid assigned subcategory", () => {
    const urls = buildProductSitemapUrls(
      [
        {
          Slug: "camera-1",
          CategoryContentId: "99, 11, 12",
          Category: { CategoryID: 1, Slug: "camera-category" },
        },
        {
          Slug: "missing-category",
          CategoryContentId: "11",
          Category: null,
        },
        {
          Slug: "",
          CategoryContentId: "11",
          Category: { CategoryID: 1, Slug: "camera-category" },
        },
        {
          Slug: "missing-subcategory",
          CategoryContentId: "99",
          Category: { CategoryID: 1, Slug: "camera-category" },
        },
        {
          Slug: "wrong-parent",
          CategoryContentId: "13",
          Category: { CategoryID: 1, Slug: "camera-category" },
        },
        {
          Slug: "empty-subcategory-slug",
          CategoryContentId: "14",
          Category: { CategoryID: 1, Slug: "camera-category" },
        },
        {
          Slug: "unavailable-category",
          CategoryContentId: "11",
          Category: { CategoryID: 2, Slug: "unavailable-category" },
        },
        {
          Slug: "null-category-slug",
          CategoryContentId: "11",
          Category: { CategoryID: 3, Slug: null },
        },
      ],
      [
        { CategoryID: 1, Slug: "camera-category" },
        { CategoryID: 3, Slug: null },
      ],
      [
        {
          CategoryContentId: 11,
          CategoryID: 1,
          Slug: "camera-subcategory",
          Category: { Slug: "camera-category" },
        },
        {
          CategoryContentId: 12,
          CategoryID: 1,
          Slug: "second-camera-subcategory",
          Category: { Slug: "camera-category" },
        },
        {
          CategoryContentId: 13,
          CategoryID: 2,
          Slug: "other-subcategory",
          Category: { Slug: "other-category" },
        },
        {
          CategoryContentId: 14,
          CategoryID: 1,
          Slug: " ",
          Category: { Slug: "camera-category" },
        },
      ]
    );

    expect(urls).toEqual([
      "https://farabak.net/products/camera-category/camera-subcategory/camera-1",
    ]);
  });
});
