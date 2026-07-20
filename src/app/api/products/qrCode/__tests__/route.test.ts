import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    product: {
      update: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { POST, DELETE } from "../route";

describe("POST /api/products/qrCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update QR code details successfully", async () => {
    mockPrisma.product.update.mockResolvedValue({
      ProductId: 1,
      QrCode_Key: "key123",
      QrCode_expiryDays: 30,
    });

    const req = new Request("http://localhost/api/products/qrCode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 1, qrCodeKey: "key123", qrCodeExpiryDays: 30 }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("QR Code details updated successfully");
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { ProductId: 1 },
      data: { QrCode_Key: "key123", QrCode_expiryDays: 30 },
    });
  });

  it("should return 400 when required fields are missing", async () => {
    const req = new Request("http://localhost/api/products/qrCode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 1 }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Missing required fields");
  });

  it("should return 500 on database error", async () => {
    mockPrisma.product.update.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/products/qrCode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 1, qrCodeKey: "key123", qrCodeExpiryDays: 30 }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/products/qrCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should remove QR code details successfully", async () => {
    mockPrisma.product.update.mockResolvedValue({
      ProductId: 1,
      QrCode_Key: null,
      QrCode_expiryDays: null,
    });

    const req = new Request("http://localhost/api/products/qrCode", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 1 }),
    });

    const res = await DELETE(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("QR Code details removed successfully");
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { ProductId: 1 },
      data: { QrCode_Key: null, QrCode_expiryDays: null },
    });
  });

  it("should return 400 when productId is missing", async () => {
    const req = new Request("http://localhost/api/products/qrCode", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await DELETE(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Missing required field");
  });

  it("should return 500 on database error", async () => {
    mockPrisma.product.update.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/products/qrCode", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 1 }),
    });

    const res = await DELETE(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
  });
});
