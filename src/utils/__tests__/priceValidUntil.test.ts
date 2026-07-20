import { describe, it, expect, vi, afterEach } from "vitest";
import { getPriceValidUntil } from "../priceValidUntil";

describe("getPriceValidUntil", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns ISO date string 2 days in the future by default", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));

    const result = getPriceValidUntil();
    const expected = new Date("2024-06-17T12:00:00Z").toISOString();
    expect(result).toBe(expected);
  });

  it("returns ISO date string N days in the future when specified", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));

    const result = getPriceValidUntil(7);
    const expected = new Date("2024-06-22T12:00:00Z").toISOString();
    expect(result).toBe(expected);
  });

  it("returns ISO date string 1 day in the future", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));

    const result = getPriceValidUntil(1);
    const expected = new Date("2024-06-16T12:00:00Z").toISOString();
    expect(result).toBe(expected);
  });

  it("returns valid ISO 8601 format", () => {
    const result = getPriceValidUntil();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});
