import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  calculateProductPricing,
  formatPriceForSchema,
  getPriceRangeForSchema,
} from "../pricingHelper";

vi.mock("../Usd2RialRate", () => ({
  fetchUsdToRialRate: vi.fn(),
}));

import { fetchUsdToRialRate } from "../Usd2RialRate";

describe("calculateProductPricing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null pricing when usdPrice is null", async () => {
    const result = await calculateProductPricing(null, null);
    expect(result).toEqual({
      originalPrice: null,
      discountedPrice: null,
      currency: "IRR",
      hasDiscount: false,
      isValidRate: false,
    });
  });

  it("returns null pricing when usdPrice is 0", async () => {
    const result = await calculateProductPricing(0, null);
    expect(result).toEqual({
      originalPrice: null,
      discountedPrice: null,
      currency: "IRR",
      hasDiscount: false,
      isValidRate: false,
    });
  });

  it("returns null pricing when exchange rate is invalid", async () => {
    vi.mocked(fetchUsdToRialRate).mockResolvedValue(null);
    const result = await calculateProductPricing(100, null);
    expect(result.isValidRate).toBe(false);
    expect(result.originalPrice).toBeNull();
  });

  it("calculates correct pricing with valid rate and no discount", async () => {
    vi.mocked(fetchUsdToRialRate).mockResolvedValue(50000);
    const result = await calculateProductPricing(100, null);
    expect(result).toEqual({
      originalPrice: 5000000,
      discountedPrice: null,
      currency: "IRR",
      hasDiscount: false,
      isValidRate: true,
    });
  });

  it("calculates discount correctly", async () => {
    vi.mocked(fetchUsdToRialRate).mockResolvedValue(50000);
    const result = await calculateProductPricing(100, 20);
    expect(result).toEqual({
      originalPrice: 5000000,
      discountedPrice: 4000000,
      currency: "IRR",
      hasDiscount: true,
      isValidRate: true,
    });
  });
});

describe("formatPriceForSchema", () => {
  it("returns '0' for null price", () => {
    expect(formatPriceForSchema(null)).toBe("0");
  });

  it("rounds and returns price as string", () => {
    expect(formatPriceForSchema(5000)).toBe("5000");
  });

  it("handles floating point", () => {
    expect(formatPriceForSchema(99.7)).toBe("100");
  });
});

describe("getPriceRangeForSchema", () => {
  it("returns min/max 0 for empty array", () => {
    expect(getPriceRangeForSchema([])).toEqual({ minPrice: "0", maxPrice: "0" });
  });

  it("returns correct range for products with prices", () => {
    const products = [{ Price: 100 }, { Price: 500 }, { Price: 200 }];
    expect(getPriceRangeForSchema(products)).toEqual({ minPrice: "100", maxPrice: "500" });
  });

  it("ignores products without valid prices", () => {
    const products = [{ Price: 0 }, { Price: null }, { notPrice: true }];
    expect(getPriceRangeForSchema(products)).toEqual({ minPrice: "0", maxPrice: "0" });
  });
});
