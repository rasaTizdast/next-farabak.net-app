import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    productSpecs: {
      createMany: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { POST } from "../route";

describe("POST /api/specs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create specs successfully", async () => {
    const specs = [
      { Name: "Battery", Title: "Battery Life", Description: "12 hours", ProductId: 1, Available: true },
      { Name: "Weight", Title: "Weight", Description: "1.5kg", ProductId: 1, Available: true },
    ];
    mockPrisma.productSpecs.createMany.mockResolvedValue({ count: 2 });

    const req = new Request("http://localhost/api/specs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(specs),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Specifications created successfully!");
    expect(body.createdRecords).toBe(2);
    expect(mockPrisma.productSpecs.createMany).toHaveBeenCalledWith({
      data: specs.map((s) => ({
        Name: s.Name,
        Title: s.Title,
        Description: s.Description,
        ProductId: s.ProductId,
        Available: s.Available,
      })),
      skipDuplicates: true,
    });
  });

  it("should return 400 for empty array", async () => {
    const req = new Request("http://localhost/api/specs", {
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
    const req = new Request("http://localhost/api/specs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ not: "an array" }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Invalid or missing payload");
  });

  it("should return 500 on error", async () => {
    mockPrisma.productSpecs.createMany.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/specs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ Name: "Test", Title: "Test", Description: "Test", ProductId: 1, Available: true }]),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Internal server error");
  });
});
