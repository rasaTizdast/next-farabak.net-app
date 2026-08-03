import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    warehouse: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET, POST } from "../route";

describe("GET /api/warehouses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return warehouses with products", async () => {
    const mockWarehouses = [
      {
        id: 1,
        name: "Warehouse A",
        warehouseproduct: [
          { Product: { name: "P1" }, ProductGrade: { grade: "A" } },
        ],
      },
    ];
    mockPrisma.warehouse.findMany.mockResolvedValue(mockWarehouses);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockWarehouses);
    expect(mockPrisma.warehouse.findMany).toHaveBeenCalledWith({
      include: {
        warehouseproduct: {
          include: {
            Product: true,
            ProductGrade: true,
          },
        },
      },
    });
  });

  it("should return 500 on error", async () => {
    mockPrisma.warehouse.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to fetch warehouses");
  });
});

describe("POST /api/warehouses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a warehouse", async () => {
    const mockWarehouse = { id: 1, name: "Warehouse A", location: "Tehran" };
    mockPrisma.warehouse.create.mockResolvedValue(mockWarehouse);

    const req = new NextRequest("http://localhost/api/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Warehouse A", location: "Tehran" }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockWarehouse);
  });

  it("should return 500 on error", async () => {
    mockPrisma.warehouse.create.mockRejectedValue(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Warehouse A", location: "Tehran" }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to create warehouse");
  });
});
