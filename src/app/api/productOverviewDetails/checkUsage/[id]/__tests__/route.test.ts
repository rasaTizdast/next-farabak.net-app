import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    details_ProductOverviewDetails: {
      count: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(function () {
    return mockPrisma;
  }),
}));

import { GET } from "../route";

describe("GET /api/productOverviewDetails/checkUsage/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return usage count for a detail", async () => {
    mockPrisma.details_ProductOverviewDetails.count.mockResolvedValue(3);

    const req = new Request("http://localhost/api/productOverviewDetails/checkUsage/1");
    const res = await GET(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.isInUse).toBe(true);
    expect(body.productsCount).toBe(3);
  });

  it("should return isInUse false when count is 0", async () => {
    mockPrisma.details_ProductOverviewDetails.count.mockResolvedValue(0);

    const req = new Request("http://localhost/api/productOverviewDetails/checkUsage/1");
    const res = await GET(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.isInUse).toBe(false);
    expect(body.productsCount).toBe(0);
  });

  it("should return 400 for invalid id", async () => {
    const req = new Request("http://localhost/api/productOverviewDetails/checkUsage/abc");
    const res = await GET(req as any, { params: Promise.resolve({ id: "abc" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid Detail ID");
  });

  it("should return 500 on database error", async () => {
    mockPrisma.details_ProductOverviewDetails.count.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/productOverviewDetails/checkUsage/1");
    const res = await GET(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain("Failed to check");
  });
});
