import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    productGrade: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET, POST } from "../route";

describe("GET /api/products/grades", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return grades for a valid productId", async () => {
    const mockGrades = [
      { ProductGradeId: 1, Grade: "A", Price: 100000, discount: 0 },
      { ProductGradeId: 2, Grade: "B", Price: 80000, discount: 10 },
    ];
    mockPrisma.productGrade.findMany.mockResolvedValue(mockGrades);

    const req = new Request("http://localhost/api/products/grades?productId=1");
    const res = await GET(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockGrades);
  });

  it("should return 400 when productId is missing", async () => {
    const req = new Request("http://localhost/api/products/grades");
    const res = await GET(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Product ID is required");
  });

  it("should return 500 on database error", async () => {
    mockPrisma.productGrade.findMany.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/products/grades?productId=1");
    const res = await GET(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain("Failed to fetch");
  });
});

describe("POST /api/products/grades", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new grade successfully", async () => {
    mockPrisma.productGrade.findFirst.mockResolvedValue(null);
    mockPrisma.productGrade.create.mockResolvedValue({
      ProductGradeId: 1,
      ProductId: 10,
      Grade: "A",
      Price: 100000,
      discount: 0,
    });

    const req = new Request("http://localhost/api/products/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 10, grade: "A", price: 100000, discount: 0 }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.Grade).toBe("A");
  });

  it("should return 400 when required fields are missing", async () => {
    const req = new Request("http://localhost/api/products/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 10 }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("required");
  });

  it("should return 400 when grade already exists for the product", async () => {
    mockPrisma.productGrade.findFirst.mockResolvedValue({ ProductGradeId: 1, Grade: "A" });

    const req = new Request("http://localhost/api/products/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 10, grade: "A", price: 100000 }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("already exists");
  });

  it("should return 500 on database error", async () => {
    mockPrisma.productGrade.findFirst.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/products/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 10, grade: "A", price: 100000 }),
    });

    const res = await POST(req as any);
    await res.json();

    expect(res.status).toBe(500);
  });
});
