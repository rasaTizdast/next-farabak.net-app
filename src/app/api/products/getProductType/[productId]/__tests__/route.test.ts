import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    product: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/products/getProductType/[productId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns product type", async () => {
    mockPrisma.product.findUnique.mockResolvedValue({ Type: "Argus Eco" });
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ productId: "1" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.productType).toBe("Argus Eco");
  });

  it("returns 400 for invalid ID", async () => {
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ productId: "abc" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 when not found", async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ productId: "999" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 500 on error", async () => {
    mockPrisma.product.findUnique.mockRejectedValue(new Error("DB error"));
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ productId: "1" }),
    });
    expect(res.status).toBe(500);
  });
});
