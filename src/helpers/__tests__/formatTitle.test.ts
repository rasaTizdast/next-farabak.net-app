import { describe, it, expect } from "vitest";

import { formatTitle } from "../formatTitle";

describe("formatTitle", () => {
  const suffix = " | فرابک";

  it("appends suffix to short title", () => {
    const result = formatTitle("My Page");
    expect(result).toBe(`My Page${suffix}`);
  });

  it("truncates title exceeding max limit and adds ellipsis", () => {
    const longTitle = "A".repeat(100);
    const result = formatTitle(longTitle, 60);
    expect(result.length).toBe(60);
    expect(result).toContain("...");
    expect(result.endsWith(suffix)).toBe(true);
  });

  it("does not truncate when title fits within limit", () => {
    const shortTitle = "Short";
    const result = formatTitle(shortTitle, 60);
    expect(result).toBe(`${shortTitle}${suffix}`);
    expect(result).not.toContain("...");
  });

  it("uses default max limit of 60", () => {
    const title = "A".repeat(45);
    const result = formatTitle(title);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result.endsWith(suffix)).toBe(true);
  });

  it("handles custom max limit", () => {
    const title = "Test Title";
    const result = formatTitle(title, 30);
    expect(result).toBe(`${title}${suffix}`);
    expect(result.length).toBeLessThanOrEqual(30);
  });

  it("truncates with custom max limit", () => {
    const title = "A".repeat(50);
    const result = formatTitle(title, 30);
    expect(result.length).toBe(30);
    expect(result).toContain("...");
  });

  it("handles empty string", () => {
    const result = formatTitle("");
    expect(result).toBe(suffix);
  });

  it("handles title that is exactly max content length", () => {
    const maxContent = 60 - suffix.length;
    const title = "A".repeat(maxContent);
    const result = formatTitle(title);
    expect(result).toBe(`${title}${suffix}`);
    expect(result).not.toContain("...");
  });
});
