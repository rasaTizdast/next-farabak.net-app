import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    categories: { findMany: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/blogs/getCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all categories with 200 status", async () => {
    mockPrisma.categories.findMany.mockResolvedValue([
      { id: 1, name: "Tech", slug: "tech" },
      { id: 2, name: "News", slug: "news" },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveLength(2);
    expect(json[0].name).toBe("Tech");
    expect(json[1].slug).toBe("news");
  });

  it("returns empty array when no categories", async () => {
    mockPrisma.categories.findMany.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual([]);
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.categories.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
