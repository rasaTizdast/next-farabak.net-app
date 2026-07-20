import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    category: { findFirst: vi.fn() },
    categoryContent: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { POST } from "../route";

describe("POST /api/breadcrumbs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns static routes directly", async () => {
    const req = new Request("http://localhost/api/breadcrumbs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: ["/", "/products", "/about-us"] }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json["/"]).toBe("صفحه اصلی");
    expect(json["/products"]).toBe("محصولات");
    expect(json["/about-us"]).toBe("درباره ما");
  });

  it("resolves dynamic category path", async () => {
    mockPrisma.category.findFirst.mockResolvedValue({ Name: "دوربین" });

    const req = new Request("http://localhost/api/breadcrumbs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: ["/products/camera"] }),
    });

    const res = await POST(req as any);
    const json = await res.json();
    expect(json["/products/camera"]).toBe("دوربین");
    expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({
      where: { Slug: "camera", Available: true },
      select: { Name: true },
    });
  });

  it("resolves dynamic subcategory path", async () => {
    mockPrisma.categoryContent.findFirst.mockResolvedValue({ Name: "باطری" });

    const req = new Request("http://localhost/api/breadcrumbs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: ["/products/camera/battery"] }),
    });

    const res = await POST(req as any);
    const json = await res.json();
    expect(json["/products/camera/battery"]).toBe("باطری");
    expect(mockPrisma.categoryContent.findFirst).toHaveBeenCalledWith({
      where: { Slug: "battery", Available: true },
      select: { Name: true },
    });
  });

  it("returns 'نامشخص' for unknown category", async () => {
    mockPrisma.category.findFirst.mockResolvedValue(null);

    const req = new Request("http://localhost/api/breadcrumbs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: ["/products/unknown"] }),
    });

    const res = await POST(req as any);
    const json = await res.json();
    expect(json["/products/unknown"]).toBe("نامشخص");
  });

  it("returns 'نامشخص' for unrecognized dynamic paths", async () => {
    const req = new Request("http://localhost/api/breadcrumbs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: ["/some/random/path"] }),
    });

    const res = await POST(req as any);
    const json = await res.json();
    expect(json["/some/random/path"]).toBe("نامشخص");
  });
});
