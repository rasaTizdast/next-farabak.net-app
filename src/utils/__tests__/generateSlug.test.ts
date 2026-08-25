import { describe, it, expect } from "vitest";

import { generateSlug } from "../generateSlug";

describe("generateSlug", () => {
  it("converts title to lowercase slug", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(generateSlug("Hello! @World#")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("one two three")).toBe("one-two-three");
  });

  it("collapses multiple hyphens", () => {
    expect(generateSlug("a---b---c")).toBe("a-b-c");
  });

  it("trims leading and trailing hyphens", () => {
    expect(generateSlug("  hello world  ")).toBe("hello-world");
  });

  it("returns empty string for non-Latin characters only", () => {
    expect(generateSlug("سلام دنیا")).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("preserves numbers", () => {
    expect(generateSlug("Product 123")).toBe("product-123");
  });

  it("preserves hyphens in input", () => {
    expect(generateSlug("my-product-name")).toBe("my-product-name");
  });

  it("preserves underscores", () => {
    expect(generateSlug("my_product_name")).toBe("my_product_name");
  });

  it("handles mixed case with numbers", () => {
    expect(generateSlug("MyProduct 2024 Edition")).toBe("myproduct-2024-edition");
  });

  it("removes dots and other punctuation", () => {
    expect(generateSlug("file.name.txt")).toBe("filenametxt");
  });
});
