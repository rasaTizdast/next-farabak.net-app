import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    productOverview: {
      findFirst: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/productOverview/getProductOverview/[productId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return product overview for a valid productId", async () => {
    const mockResult = {
      ProductId: 1,
      Property1: "A",
      Property2: "B",
      Property3: "C",
      Property4: "D",
    };
    mockPrisma.productOverview.findFirst.mockResolvedValue(mockResult);

    const req = new Request("http://localhost/api/productOverview/getProductOverview/1");
    const res = await GET(req as any, { params: Promise.resolve({ productId: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockResult);
  });

  it("should return 404 when no product overview found", async () => {
    mockPrisma.productOverview.findFirst.mockResolvedValue(null);

    const req = new Request("http://localhost/api/productOverview/getProductOverview/999");
    const res = await GET(req as any, { params: Promise.resolve({ productId: "999" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toContain("No product found");
  });

  it("should return 500 on database error", async () => {
    mockPrisma.productOverview.findFirst.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/productOverview/getProductOverview/1");
    const res = await GET(req as any, { params: Promise.resolve({ productId: "1" }) });

    expect(res.status).toBe(500);
  });
});
