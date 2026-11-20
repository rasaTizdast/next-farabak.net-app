import { describe, expect, it } from "vitest";

import { buildProductSitemapUrls } from "./sitemap-utils";

describe("buildProductSitemapUrls", () => {
  it("requires an available primary subcategory that belongs to the product category", () => {
    const urls = buildProductSitemapUrls(
      [
        {
          Slug: "camera-1",
          CategoryContentId: "invalid,0,9007199254740992, 11, 12",
          Category: { CategoryID: 1 },
        },
        {
          Slug: "missing-category",
          CategoryContentId: "11",
          Category: null,
        },
        {
          Slug: "",
          CategoryContentId: "11",
          Category: { CategoryID: 1 },
        },
        {
          Slug: "missing-subcategory",
          CategoryContentId: "99,11",
          Category: { CategoryID: 1 },
        },
        {
          Slug: "wrong-parent",
          CategoryContentId: "13,11",
          Category: { CategoryID: 1 },
        },
        {
          Slug: "empty-subcategory-slug",
          CategoryContentId: "14",
          Category: { CategoryID: 1 },
        },
        {
          Slug: "unavailable-category",
          CategoryContentId: "11",
          Category: { CategoryID: 2 },
        },
        {
          Slug: "null-category-slug",
          CategoryContentId: "11",
          Category: { CategoryID: 3 },
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
