import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    master_ProductOverviewDetails: {
      findMany: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/productOverviewDetails/getAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return all overview details", async () => {
    const mockData = [
      { ProductOverviewDetailsId: 1, Title: "A", Img: "/img/a.png", Description: "Desc A" },
      { ProductOverviewDetailsId: 2, Title: "B", Img: "/img/b.png", Description: "Desc B" },
    ];
    mockPrisma.master_ProductOverviewDetails.findMany.mockResolvedValue(mockData);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockData);
    expect(mockPrisma.master_ProductOverviewDetails.findMany).toHaveBeenCalledWith({
      select: {
        ProductOverviewDetailsId: true,
        Title: true,
        Img: true,
        Description: true,
      },
      orderBy: { id: "desc" },
    });
  });

  it("should return 500 on database error", async () => {
    mockPrisma.master_ProductOverviewDetails.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to fetch overview details");
  });
});
