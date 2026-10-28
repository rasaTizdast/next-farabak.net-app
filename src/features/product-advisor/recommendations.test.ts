import { describe, expect, it } from "vitest";

import { advisorCategoryDefinitions } from "./category-definitions";
import { recommendProducts } from "./recommendations";
import type { AdvisorProductSnapshot } from "./types";

const reolinkDefinition = advisorCategoryDefinitions["reolink-cctv-camera"];

const products: AdvisorProductSnapshot[] = [
  {
    productId: 1,
    categorySlug: "reolink-cctv-camera",
    subcategorySlug: "outdoor-camera",
    name: "دوربین فضای باز",
    model: "RLC-OUT",
    imageUrl: null,
    detailHref: "/products/reolink-cctv-camera/outdoor-camera/rlc-out",
    specs: [
      { key: "placement", label: "محل نصب", value: "outdoor", sourceLabel: "محل نصب" },
      { key: "night-detail", label: "جزئیات شب", value: "high", sourceLabel: "دید در شب" },
    ],
  },
  {
    productId: 2,
    categorySlug: "reolink-cctv-camera",
    subcategorySlug: "outdoor-camera",
    name: "دوربین با مشخصات ناقص",
    model: "RLC-UNKNOWN",
    imageUrl: null,
    detailHref: "/products/reolink-cctv-camera/outdoor-camera/rlc-unknown",
    specs: [{ key: "placement", label: "محل نصب", value: "outdoor", sourceLabel: "محل نصب" }],
  },
];

describe("recommendProducts", () => {
  it("marks an unanswered verified field as unknown instead of a match", () => {
    const result = recommendProducts(reolinkDefinition, products, [
      { questionId: "placement", value: "outdoor" },
      { questionId: "night-detail", value: "high" },
    ]);

    const incompleteCandidate = result.candidates.find(
      (candidate) => candidate.product.productId === 2
    );

    expect(incompleteCandidate?.unknown).toContain("جزئیات شبِ بالا ثبت شده است");
    expect(incompleteCandidate?.matched).not.toContain("جزئیات شبِ بالا ثبت شده است");
  });

  it("returns a narrowed catalogue result when no candidate has enough verified evidence", () => {
    const result = recommendProducts(
      reolinkDefinition,
      [products[1]],
      [
        { questionId: "placement", value: "outdoor" },
        { questionId: "night-detail", value: "high" },
      ]
    );

    expect(result.mode).toBe("narrowed");
    expect(result.candidates).toHaveLength(1);
  });
});
