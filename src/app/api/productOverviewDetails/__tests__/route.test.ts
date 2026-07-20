import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    details_ProductOverviewDetails: {
      createMany: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { POST } from "../route";

describe("POST /api/productOverviewDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create multiple overview details successfully", async () => {
    const payload = [
      { ProductOverviewDetailsId: 1, ProductId: 10, ProductName: "Product A" },
      { ProductOverviewDetailsId: 2, ProductId: 10, ProductName: "Product A" },
    ];
    mockPrisma.details_ProductOverviewDetails.createMany.mockResolvedValue({ count: 2 });

    const req = new Request("http://localhost/api/productOverviewDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Details created successfully!");
    expect(body.createdRecords).toBe(2);
  });

  it("should return 400 for empty array", async () => {
    const req = new Request("http://localhost/api/productOverviewDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([]),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Invalid or missing payload");
  });

  it("should return 400 for non-array payload", async () => {
    const req = new Request("http://localhost/api/productOverviewDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ not: "array" }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Invalid or missing payload");
  });

  it("should return 500 on database error", async () => {
    mockPrisma.details_ProductOverviewDetails.createMany.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/productOverviewDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ ProductOverviewDetailsId: 1, ProductId: 10, ProductName: "A" }]),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });
});
