import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import sitemap from "./sitemap";

const { mockGetSitemapUrls } = vi.hoisted(() => ({
  mockGetSitemapUrls: vi.fn(),
}));

vi.mock("@/lib/data/sitemap", () => ({
  getSitemapUrls: mockGetSitemapUrls,
}));

describe("sitemap modification dates", () => {
  afterEach(() => vi.restoreAllMocks());

  beforeEach(() => vi.clearAllMocks());

  it("does not assign generation time as lastmod for URL-backed entries", async () => {
    mockGetSitemapUrls.mockResolvedValue({
      urls: ["https://farabak.net", "https://farabak.net/products/x-ray"],
    });

    const entries = await sitemap();

    expect(entries).toHaveLength(2);
    expect(entries.every((entry) => !("lastModified" in entry))).toBe(true);
  });

  it("does not assign generation time as lastmod to fallback entries", async () => {
    mockGetSitemapUrls.mockRejectedValue(new Error("data source unavailable"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const entries = await sitemap();

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => !("lastModified" in entry))).toBe(true);
  });
});
