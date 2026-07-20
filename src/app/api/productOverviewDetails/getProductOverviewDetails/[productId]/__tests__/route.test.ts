import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    details_ProductOverviewDetails: {
      findMany: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/productOverviewDetails/getProductOverviewDetails/[productId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return product overview details for valid productId", async () => {
    const mockData = [
      {
        ProductOverviewDetailsId: 1,
        ProductName: "Product A",
        Master_ProductOverviewDetails: { Title: "T1", Description: "D1", Img: "/img1.png" },
      },
    ];
    mockPrisma.details_ProductOverviewDetails.findMany.mockResolvedValue(mockData);

    const req = new Request("http://localhost/api/productOverviewDetails/getProductOverviewDetails/10");
    const res = await GET(req as any, { params: Promise.resolve({ productId: "10" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].Title).toBe("T1");
    expect(body[0].Description).toBe("D1");
  });

  it("should return 404 when no details found", async () => {
    mockPrisma.details_ProductOverviewDetails.findMany.mockResolvedValue([]);

    const req = new Request("http://localhost/api/productOverviewDetails/getProductOverviewDetails/999");
    const res = await GET(req as any, { params: Promise.resolve({ productId: "999" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toContain("No product found");
  });

  it("should return 400 for invalid productId format", async () => {
    const req = new Request("http://localhost/api/productOverviewDetails/getProductOverviewDetails/abc");
    const res = await GET(req as any, { params: Promise.resolve({ productId: "abc" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toContain("Invalid product ID format");
  });

  it("should return 500 on database error", async () => {
    mockPrisma.details_ProductOverviewDetails.findMany.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/productOverviewDetails/getProductOverviewDetails/1");
    const res = await GET(req as any, { params: Promise.resolve({ productId: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain("Failed to fetch product overview details");
  });
});
