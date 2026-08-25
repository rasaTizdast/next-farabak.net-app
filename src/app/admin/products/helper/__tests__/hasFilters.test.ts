import { describe, it, expect } from "vitest";

import { hasFilters } from "../hasFilters";

describe("hasFilters", () => {
  it("returns false when filters is undefined", () => {
    expect(hasFilters(undefined)).toBe(false);
  });

  it("returns false when all fields are empty/null", () => {
    expect(hasFilters({ category: "", subCategory: "", available: null })).toBe(false);
  });

  it("returns true when category is provided", () => {
    expect(hasFilters({ category: "electronics", subCategory: "", available: null })).toBe(true);
  });

  it("returns true when subCategory is provided", () => {
    expect(hasFilters({ category: "", subCategory: "phones", available: null })).toBe(true);
  });

  it("returns true when available is not null (true)", () => {
    expect(hasFilters({ category: "", subCategory: "", available: true })).toBe(true);
  });

  it("returns true when available is not null (false)", () => {
    expect(hasFilters({ category: "", subCategory: "", available: false })).toBe(true);
  });

  it("returns true when multiple filters are provided", () => {
    expect(hasFilters({ category: "electronics", subCategory: "phones", available: true })).toBe(
      true
    );
  });

  it("treats whitespace-only category as no filter", () => {
    expect(hasFilters({ category: "   ", subCategory: "", available: null })).toBe(false);
  });

  it("treats whitespace-only subCategory as no filter", () => {
    expect(hasFilters({ category: "", subCategory: "   ", available: null })).toBe(false);
  });
});
