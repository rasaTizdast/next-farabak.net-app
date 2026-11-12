import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetSitemapUrls } = vi.hoisted(() => ({ mockGetSitemapUrls: vi.fn() }));

vi.mock("@/lib/data/sitemap", () => ({ getSitemapUrls: mockGetSitemapUrls }));

import { GET } from "../route";

describe("GET /api/sitemap", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the shared sitemap URL list", async () => {
    const result = {
      urls: ["https://farabak.net", "https://farabak.net/products/camera-category"],
    };
    mockGetSitemapUrls.mockResolvedValue(result);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(result);
    expect(mockGetSitemapUrls).toHaveBeenCalledOnce();
  });

  it("returns a generic server error when sitemap generation fails", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetSitemapUrls.mockRejectedValue(new Error("database connection details"));

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe("Failed to generate sitemap");
    expect(logError).toHaveBeenCalledOnce();
    logError.mockRestore();
  });
});
