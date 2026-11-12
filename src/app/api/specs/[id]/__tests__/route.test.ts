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

describe("GET /api/specs/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return specs for a valid product ID", async () => {
    const specs = [
      { ProductSpecsId: 1, Title: "Battery", Description: "12 hours" },
      { ProductSpecsId: 2, Title: "Weight", Description: "1.5kg" },
    ];
    mockPrisma.productSpecs.findMany.mockResolvedValue(specs);

    const req = new Request("http://localhost/api/specs/1");
    const res = await GET(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(specs);
    expect(mockPrisma.productSpecs.findMany).toHaveBeenCalledWith({
      where: { ProductId: 1, Available: true },
      select: { ProductSpecsId: true, Title: true, Description: true },
    });
  });

  it("should return 400 for invalid product ID", async () => {
    const req = new Request("http://localhost/api/specs/abc");
    const res = await GET(req as any, { params: Promise.resolve({ id: "abc" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Invalid product ID");
  });

  it("should return 500 on error", async () => {
    mockPrisma.productSpecs.findMany.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/specs/1");
    const res = await GET(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Error fetching product specs");
  });
});
