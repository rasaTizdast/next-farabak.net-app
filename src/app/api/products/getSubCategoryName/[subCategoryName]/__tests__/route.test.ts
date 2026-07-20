import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    categoryContent: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/products/getSubCategoryName/[subCategoryName]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns subcategory name", async () => {
    mockPrisma.categoryContent.findFirst.mockResolvedValue({ Name: "PTZ Cameras" });
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ subCategoryName: "ptz" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.subCategoryName).toBe("PTZ Cameras");
  });

  it("returns 404 when not found", async () => {
    mockPrisma.categoryContent.findFirst.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ subCategoryName: "unknown" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 500 on error", async () => {
    mockPrisma.categoryContent.findFirst.mockRejectedValue(new Error("DB error"));
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ subCategoryName: "ptz" }),
    });
    expect(res.status).toBe(500);
  });
});
