import { describe, it, expect } from "vitest";
import { getCurrentJalaliDate, formatJalaliDate } from "../jalaliDate";

describe("getCurrentJalaliDate", () => {
  it("returns a string in YYYY-MM-DD format", () => {
    const result = getCurrentJalaliDate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a valid Jalali year (1300-1500)", () => {
    const result = getCurrentJalaliDate();
    const year = parseInt(result.split("-")[0], 10);
    expect(year).toBeGreaterThanOrEqual(1300);
    expect(year).toBeLessThanOrEqual(1500);
  });

  it("returns zero-padded month and day", () => {
    const result = getCurrentJalaliDate();
    const [, month, day] = result.split("-");
    expect(month.length).toBe(2);
    expect(day.length).toBe(2);
  });
});

describe("formatJalaliDate", () => {
  it("returns 'تاریخ نامشخص' for empty string", () => {
    expect(formatJalaliDate("")).toBe("تاریخ نامشخص");
  });

  it("formats date-only Jalali string", () => {
    const result = formatJalaliDate("1403-01-01");
    expect(result).toBe("1403/01/01");
  });

  it("formats Jalali date-time without time when includeTime is false", () => {
    const result = formatJalaliDate("1403-06-15T14:30:00", false);
    expect(result).toBe("1403/06/15");
  });

  it("formats Jalali date-time with time when includeTime is true", () => {
    const result = formatJalaliDate("1403-06-15T14:30:45", true);
    expect(result).toBe("1403/06/15 - 14:30:45");
  });

  it("handles Jalali date-time without seconds", () => {
    const result = formatJalaliDate("1403-06-15T14:30", true);
    expect(result).toContain("1403/06/15");
    expect(result).toContain("14:30");
  });

  it("returns original string on invalid input", () => {
    const result = formatJalaliDate("invalid-date");
    expect(result).toBe("invalid-date");
  });

  it("formats with zero-padded months and days", () => {
    const result = formatJalaliDate("1403-01-05");
    expect(result).toBe("1403/01/05");
  });
});
