import { describe, expect, it } from "vitest";

import { blackwonderHeroSrc, blackwonderProducts } from "./blackwonder-products";

describe("BlackWonder landing range", () => {
  it("uses the live catalog category and product image variants", () => {
    expect(blackwonderProducts.length).toBeGreaterThanOrEqual(6);
    expect(
      blackwonderProducts.every((product) =>
        product.href.startsWith("/products/industrial-cctv-camera/black-wonder/")
      )
    ).toBe(true);
    expect(blackwonderProducts.every((product) => product.image.endsWith(".webp"))).toBe(true);
    expect(blackwonderProducts.map((product) => product.slug)).toEqual(
      expect.arrayContaining(["bwd-m8", "sgx-ex-sd1", "sgc-ex-sh-x36c-network"])
    );
  });

  it("uses a dedicated WebP hero asset for the BlackWonder chapter", () => {
    expect(blackwonderHeroSrc).toBe("/landing/blackwonder-range-v6.webp");
    expect(blackwonderHeroSrc).toMatch(/\.webp$/);
  });
});
