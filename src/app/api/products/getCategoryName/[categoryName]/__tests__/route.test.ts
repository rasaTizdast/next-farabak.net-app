import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    category: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/products/getCategoryName/[categoryName]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns category name", async () => {
    mockPrisma.category.findFirst.mockResolvedValue({ Name: "Home Edition" });
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categoryName: "home-edition" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.categoryName).toBe("Home Edition");
  });

  it("returns 404 when not found", async () => {
    mockPrisma.category.findFirst.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categoryName: "unknown" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 500 on error", async () => {
    mockPrisma.category.findFirst.mockRejectedValue(new Error("DB error"));
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categoryName: "home-edition" }),
    });
    expect(res.status).toBe(500);
  });
});
