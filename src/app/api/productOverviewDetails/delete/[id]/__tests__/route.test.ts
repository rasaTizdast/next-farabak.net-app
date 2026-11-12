import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockS3 } = vi.hoisted(() => ({
  mockPrisma: {
    master_ProductOverviewDetails: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    details_ProductOverviewDetails: {
      deleteMany: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
  mockS3: {
    deleteObject: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
  },
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(function () {
    return mockPrisma;
  }),
}));
vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () {
    return mockS3;
  }),
}));

import { DELETE } from "../route";

describe("DELETE /api/productOverviewDetails/delete/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete overview detail and associations successfully", async () => {
    mockPrisma.master_ProductOverviewDetails.findUnique.mockResolvedValue({
      ProductOverviewDetailsId: 5,
      Img: "/test.png",
    });
    mockPrisma.details_ProductOverviewDetails.deleteMany.mockResolvedValue({ count: 2 });
    mockPrisma.master_ProductOverviewDetails.delete.mockResolvedValue({});

    const req = new Request("http://localhost/api/productOverviewDetails/delete/5", {
      method: "DELETE",
    });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "5" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrisma.details_ProductOverviewDetails.deleteMany).toHaveBeenCalledWith({
      where: { ProductOverviewDetailsId: 5 },
    });
    expect(mockPrisma.master_ProductOverviewDetails.delete).toHaveBeenCalledWith({
      where: { ProductOverviewDetailsId: 5 },
    });
  });

  it("should return 400 for invalid id", async () => {
    const req = new Request("http://localhost/api/productOverviewDetails/delete/abc", {
      method: "DELETE",
    });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "abc" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid Detail ID");
  });

  it("should return 404 when overview detail not found", async () => {
    mockPrisma.master_ProductOverviewDetails.findUnique.mockResolvedValue(null);

    const req = new Request("http://localhost/api/productOverviewDetails/delete/999", {
      method: "DELETE",
    });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "999" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Overview detail not found");
  });

  it("should return 500 on database error", async () => {
    mockPrisma.master_ProductOverviewDetails.findUnique.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/productOverviewDetails/delete/5", {
      method: "DELETE",
    });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "5" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain("Failed to delete");
  });
});
