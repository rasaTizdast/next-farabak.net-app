import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    blogs: { update: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { POST, DELETE } from "../route";

function makeRequest(body: Record<string, unknown>, method = "POST") {
  return new Request("http://localhost/api/blogs/qrCode", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/blogs/qrCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates/updates QR code for a blog", async () => {
    const updatedBlog = { id: 1, QrCode_key: "qr-key-123", QrCode_expiryDays: 30 };
    mockPrisma.blogs.update.mockResolvedValue(updatedBlog);

    const req = makeRequest({ blogId: 1, qrCodeKey: "qr-key-123", qrCodeExpiryDays: 30 });
    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.QrCode_key).toBe("qr-key-123");
    expect(json.QrCode_expiryDays).toBe(30);

    expect(mockPrisma.blogs.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { QrCode_key: "qr-key-123", QrCode_expiryDays: 30 },
    });
  });

  it("sets expiryDays to null when not provided", async () => {
    mockPrisma.blogs.update.mockResolvedValue({ id: 1, QrCode_key: "key" });

    const req = makeRequest({ blogId: 1, qrCodeKey: "key" });
    const res = await POST(req as any);
    expect(res.status).toBe(200);

    expect(mockPrisma.blogs.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { QrCode_key: "key", QrCode_expiryDays: null },
    });
  });

  it("returns 400 when blogId is missing", async () => {
    const req = makeRequest({ qrCodeKey: "key" });
    const res = await POST(req as any);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("الزامی");
  });

  it("returns 400 when qrCodeKey is missing", async () => {
    const req = makeRequest({ blogId: 1 });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogs.update.mockRejectedValue(new Error("DB error"));

    const req = makeRequest({ blogId: 1, qrCodeKey: "key" });
    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/blogs/qrCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes QR code from a blog", async () => {
    const updatedBlog = { id: 1, QrCode_key: null, QrCode_expiryDays: null };
    mockPrisma.blogs.update.mockResolvedValue(updatedBlog);

    const req = makeRequest({ blogId: 1 }, "DELETE");
    const res = await DELETE(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.QrCode_key).toBeNull();
    expect(json.QrCode_expiryDays).toBeNull();

    expect(mockPrisma.blogs.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { QrCode_key: null, QrCode_expiryDays: null },
    });
  });

  it("returns 400 when blogId is missing", async () => {
    const req = makeRequest({}, "DELETE");
    const res = await DELETE(req as any);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("الزامی");
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogs.update.mockRejectedValue(new Error("DB error"));

    const req = makeRequest({ blogId: 1 }, "DELETE");
    const res = await DELETE(req as any);
    expect(res.status).toBe(500);
  });
});
