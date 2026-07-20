import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    productSpecs: {
      findMany: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/products/getProductSpecsByProductId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return product specs for a valid productId", async () => {
    const mockSpecs = [
      { SpecId: 1, ProductId: 10, SpecName: "Battery", SpecValue: "5000mAh" },
      { SpecId: 2, ProductId: 10, SpecName: "RAM", SpecValue: "8GB" },
    ];
    mockPrisma.productSpecs.findMany.mockResolvedValue(mockSpecs);

    const req = new Request("http://localhost/api/products/getProductSpecsByProductId?productId=10");
    const res = await GET(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual(mockSpecs);
  });

  it("should return 400 when productId is invalid", async () => {
    const req = new Request("http://localhost/api/products/getProductSpecsByProductId?productId=abc");
    const res = await GET(req as any);

    expect(res.status).toBe(400);
  });

  it("should return 404 when no specs found", async () => {
    mockPrisma.productSpecs.findMany.mockResolvedValue([]);

    const req = new Request("http://localhost/api/products/getProductSpecsByProductId?productId=999");
    const res = await GET(req as any);

    expect(res.status).toBe(404);
  });

  it("should return 500 on database error", async () => {
    mockPrisma.productSpecs.findMany.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/products/getProductSpecsByProductId?productId=10");
    const res = await GET(req as any);

    expect(res.status).toBe(500);
  });
});
