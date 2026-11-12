import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    productGrade: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { PUT, DELETE } from "../route";

describe("PUT /api/products/grades/[productId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update a grade successfully", async () => {
    mockPrisma.productGrade.findUnique.mockResolvedValue({ ProductId: 10 });
    mockPrisma.productGrade.findFirst.mockResolvedValue(null);
    mockPrisma.productGrade.update.mockResolvedValue({
      ProductGradeId: 5,
      Grade: "A",
      Price: 200000,
      discount: 5,
    });

    const req = new Request("http://localhost/api/products/grades/5", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade: "A", price: 200000, discount: 5 }),
    });

    const res = await PUT(req as any, { params: Promise.resolve({ productId: "5" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.Grade).toBe("A");
  });

  it("should return 400 when grade or price is missing", async () => {
    const req = new Request("http://localhost/api/products/grades/5", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade: "A" }),
    });

    const res = await PUT(req as any, { params: Promise.resolve({ productId: "5" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("required");
  });

  it("should return 400 when duplicate grade exists", async () => {
    mockPrisma.productGrade.findUnique.mockResolvedValue({ ProductId: 10 });
    mockPrisma.productGrade.findFirst.mockResolvedValue({ ProductGradeId: 99 });

    const req = new Request("http://localhost/api/products/grades/5", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade: "B", price: 100000 }),
    });

    const res = await PUT(req as any, { params: Promise.resolve({ productId: "5" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("already exists");
  });

  it("should return 500 on error", async () => {
    mockPrisma.productGrade.findUnique.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/products/grades/5", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade: "A", price: 100000 }),
    });

    const res = await PUT(req as any, { params: Promise.resolve({ productId: "5" }) });
    await res.json();

    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/products/grades/[productId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a grade successfully", async () => {
    mockPrisma.productGrade.delete.mockResolvedValue({});

    const req = new Request("http://localhost/api/products/grades/5", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ productId: "5" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Grade deleted successfully");
  });

  it("should return 500 on error", async () => {
    mockPrisma.productGrade.delete.mockRejectedValue(new Error("Not found"));

    const req = new Request("http://localhost/api/products/grades/999", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ productId: "999" }) });
    await res.json();

    expect(res.status).toBe(500);
  });
});
