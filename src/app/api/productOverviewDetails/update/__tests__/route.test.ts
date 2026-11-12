import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    details_ProductOverviewDetails: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { PUT } from "../route";

describe("PUT /api/productOverviewDetails/update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update overview details by adding and removing associations", async () => {
    mockPrisma.details_ProductOverviewDetails.findMany.mockResolvedValue([
      { ProductOverviewDetailsId: 1 },
      { ProductOverviewDetailsId: 2 },
    ]);
    mockPrisma.details_ProductOverviewDetails.create.mockResolvedValue({});
    mockPrisma.details_ProductOverviewDetails.deleteMany.mockResolvedValue({ count: 1 });

    const body = {
      productId: 10,
      selectedDetails: [{ ProductOverviewDetailsId: 1 }, { ProductOverviewDetailsId: 3 }],
      ProductName: "Product A",
    };

    const req = new Request("http://localhost/api/productOverviewDetails/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const res = await PUT(req as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Product overview details updated successfully");
    expect(mockPrisma.details_ProductOverviewDetails.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.details_ProductOverviewDetails.deleteMany).toHaveBeenCalledTimes(1);
  });

  it("should return 400 when productId is missing", async () => {
    const req = new Request("http://localhost/api/productOverviewDetails/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedDetails: [], ProductName: "A" }),
    });

    const res = await PUT(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Invalid input");
  });

  it("should return 400 when selectedDetails is not an array", async () => {
    const req = new Request("http://localhost/api/productOverviewDetails/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 1, selectedDetails: "not-array", ProductName: "A" }),
    });

    const res = await PUT(req as any);
    await res.json();

    expect(res.status).toBe(400);
  });

  it("should return 500 on database error", async () => {
    mockPrisma.details_ProductOverviewDetails.findMany.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/productOverviewDetails/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 1, selectedDetails: [], ProductName: "A" }),
    });

    const res = await PUT(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain("Internal server error");
  });
});
