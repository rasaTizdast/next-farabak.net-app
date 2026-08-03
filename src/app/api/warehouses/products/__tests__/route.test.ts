import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    warehouseproduct: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { POST, PUT } from "../route";

describe("POST /api/warehouses/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add product to warehouse", async () => {
    const mockProduct = {
      warehouseproductid: 1,
      warehouseid: 1,
      ProductId: 10,
      ProductGradeId: 20,
      quantity: 5,
      Product: { name: "P1" },
      ProductGrade: { grade: "A" },
    };
    mockPrisma.warehouseproduct.create.mockResolvedValue(mockProduct);

    const req = new NextRequest("http://localhost/api/warehouses/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouseid: 1,
        ProductId: 10,
        ProductGradeId: 20,
        quantity: 5,
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockProduct);
  });

  it("should default quantity to 0", async () => {
    const mockProduct = {
      warehouseproductid: 1,
      warehouseid: 1,
      ProductId: 10,
      ProductGradeId: 20,
      quantity: 0,
      Product: { name: "P1" },
      ProductGrade: { grade: "A" },
    };
    mockPrisma.warehouseproduct.create.mockResolvedValue(mockProduct);

    const req = new NextRequest("http://localhost/api/warehouses/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouseid: 1,
        ProductId: 10,
        ProductGradeId: 20,
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockPrisma.warehouseproduct.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ quantity: 0 }),
      })
    );
  });

  it("should return 500 on error", async () => {
    mockPrisma.warehouseproduct.create.mockRejectedValue(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/warehouses/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warehouseid: 1, ProductId: 10, ProductGradeId: 20 }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to add product to warehouse");
  });
});

describe("PUT /api/warehouses/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update warehouse product", async () => {
    const mockUpdated = {
      warehouseproductid: 1,
      ProductGradeId: 30,
      quantity: 10,
      Product: { name: "P1" },
      ProductGrade: { grade: "B" },
    };
    mockPrisma.warehouseproduct.update.mockResolvedValue(mockUpdated);

    const req = new NextRequest("http://localhost/api/warehouses/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouseproductid: 1,
        ProductGradeId: 30,
        quantity: 10,
      }),
    });

    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockUpdated);
  });

  it("should return 500 on error", async () => {
    mockPrisma.warehouseproduct.update.mockRejectedValue(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/warehouses/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warehouseproductid: 1, ProductGradeId: 30, quantity: 10 }),
    });

    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to update warehouse product");
  });
});
