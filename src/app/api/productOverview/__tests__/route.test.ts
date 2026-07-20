import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    productOverview: {
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { POST } from "../route";

describe("POST /api/productOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    ProductId: 101,
    ProductName: "Smartphone X",
    Features: ["Fast charging", "Water-resistant", "AMOLED display", "Dual cameras"],
  };

  it("should create a new overview when none exists", async () => {
    mockPrisma.productOverview.findFirst.mockResolvedValue(null);
    mockPrisma.productOverview.create.mockResolvedValue({ id: 1, ...validBody, Available: true });

    const req = new Request("http://localhost/api/productOverview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe(1);
    expect(mockPrisma.productOverview.create).toHaveBeenCalledWith({
      data: {
        ProductId: 101,
        ProductName: "Smartphone X",
        Property1: "Fast charging",
        Property2: "Water-resistant",
        Property3: "AMOLED display",
        Property4: "Dual cameras",
        Available: true,
      },
    });
  });

  it("should update an existing overview", async () => {
    mockPrisma.productOverview.findFirst.mockResolvedValue({ id: 1, ProductId: 101 });
    mockPrisma.productOverview.updateMany.mockResolvedValue({ count: 1 });

    const req = new Request("http://localhost/api/productOverview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(1);
    expect(mockPrisma.productOverview.updateMany).toHaveBeenCalled();
    expect(mockPrisma.productOverview.create).not.toHaveBeenCalled();
  });

  it("should return 400 when ProductId is missing", async () => {
    const req = new Request("http://localhost/api/productOverview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ProductName: "X", Features: [] }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Invalid input");
  });

  it("should return 500 on database error", async () => {
    mockPrisma.productOverview.findFirst.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/productOverview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain("Internal server error");
  });
});
