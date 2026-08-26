import { describe, expect, it } from "vitest";

import { validateHeadingHierarchy } from "../contentHelper";

describe("validateHeadingHierarchy", () => {
  it("returns valid for a single H1 with logical sub-headings", () => {
    const result = validateHeadingHierarchy([
      { level: 1, text: "عنوان اصلی" },
      { level: 2, text: "ویژگی‌ها" },
      { level: 3, text: "دوام" },
      { level: 2, text: "قیمت" },
    ]);

    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("flags a missing H1", () => {
    const result = validateHeadingHierarchy([
      { level: 2, text: "ویژگی‌ها" },
      { level: 3, text: "دوام" },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.issues[0].message).toContain("h1");
  });

  it("flags multiple H1 tags", () => {
    const result = validateHeadingHierarchy([
      { level: 1, text: "عنوان اول" },
      { level: 1, text: "عنوان دوم" },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.issues[0].message).toContain("بیش از یک");
  });

  it("flags skipped heading levels", () => {
    const result = validateHeadingHierarchy([
      { level: 1, text: "عنوان اصلی" },
      { level: 2, text: "ویژگی‌ها" },
      { level: 4, text: "دوام" },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.issues[0].level).toBe(4);
    expect(result.issues[0].text).toBe("دوام");
  });

  it("allows headings to return to higher levels", () => {
    const result = validateHeadingHierarchy([
      { level: 1, text: "عنوان اصلی" },
      { level: 3, text: "زیربخش" },
      { level: 2, text: "بخش بعدی" },
    ]);

    // h1 -> h3 is a skip; h3 -> h2 going back up is fine
    expect(result.issues).toHaveLength(1);
    expect(result.isValid).toBe(false);
  });

  it("returns valid for empty input aside from missing H1", () => {
    const result = validateHeadingHierarchy([]);

    expect(result.isValid).toBe(false);
    expect(result.issues).toHaveLength(1);
  });
});
