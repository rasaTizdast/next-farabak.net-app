import { describe, expect, it } from "vitest";

import { advisorCategoryDefinitions } from "./category-definitions";
import { recommendProducts } from "./recommendations";
import type { AdvisorCategoryDefinition, AdvisorProductSnapshot } from "./types";

const reolinkDefinition = advisorCategoryDefinitions["reolink-cctv-camera"];

const products: AdvisorProductSnapshot[] = [
  {
    productId: 1,
    categorySlug: "reolink-cctv-camera",
    subcategorySlug: "outdoor-camera",
    name: "دوربین فضای باز",
    model: "RLC-OUT",
    sourceText: "دوربین فضای باز",
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
    sourceText: "دوربین با مشخصات ناقص",
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

  it("ranks catalogue families from verified product names without requesting another service", () => {
    const definition: AdvisorCategoryDefinition = {
      slug: "blackmagic",
      label: "بلک‌مجیک",
      intentIds: [],
      questions: [],
      normalizers: [],
      rules: [
        {
          questionId: "workflow",
          optionId: "live",
          productKeywords: ["atem"],
          evidenceLabel: "برای تولید زنده ثبت شده است",
        },
        {
          questionId: "form-factor",
          optionId: "compact",
          productKeywords: ["mini"],
          evidenceLabel: "فرم جمع‌وجور در نام محصول ثبت شده است",
        },
      ],
    };

    const result = recommendProducts(definition, [
      { ...products[0], productId: 3, name: "ATEM Mini Pro", model: "ATEM Mini Pro" },
      { ...products[0], productId: 4, name: "DeckLink 8K Pro", model: "DeckLink 8K Pro" },
    ], [
      { questionId: "workflow", value: "live" },
      { questionId: "form-factor", value: "compact" },
    ]);

    expect(result.mode).toBe("ranked");
    expect(result.candidates[0]?.product.productId).toBe(3);
    expect(result.candidates[0]?.matched).toHaveLength(2);
  });
});
