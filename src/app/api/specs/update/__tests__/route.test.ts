import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    productSpecs: {
      updateMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { POST } from "../route";

describe("POST /api/specs/update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update existing specs and create new specs", async () => {
    mockPrisma.productSpecs.updateMany.mockResolvedValue({ count: 3 });
    mockPrisma.productSpecs.update.mockResolvedValue({ ProductSpecsId: 1 });
    mockPrisma.productSpecs.create.mockResolvedValue({ ProductSpecsId: 10 });

    const req = new Request("http://localhost/api/specs/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: 1,
        specs: [
          { ProductSpecsId: 1, Title: "Updated Title", Description: "Updated Desc" },
          { Title: "New Title", Description: "New Desc" },
        ],
      }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Specs updated successfully");
    expect(mockPrisma.productSpecs.updateMany).toHaveBeenCalledWith({
      where: { ProductId: 1 },
      data: { Available: false },
    });
    expect(mockPrisma.productSpecs.update).toHaveBeenCalledWith({
      where: { ProductSpecsId: 1 },
      data: expect.objectContaining({
        Title: "Updated Title",
        Description: "Updated Desc",
        Available: true,
      }),
    });
    expect(mockPrisma.productSpecs.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ProductId: 1,
        Title: "New Title",
        Description: "New Desc",
        Available: true,
      }),
    });
  });

  it("should return 400 when productId is missing", async () => {
    const req = new Request("http://localhost/api/specs/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ specs: [] }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Product ID is required");
  });

  it("should return 500 on error", async () => {
    mockPrisma.productSpecs.updateMany.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/specs/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 1, specs: [] }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Error updating product specs");
  });
});
