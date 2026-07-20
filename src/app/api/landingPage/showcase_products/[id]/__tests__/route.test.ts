import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    showcase_products: {
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { DELETE, PATCH } from "../route";

describe("DELETE /api/landingPage/showcase_products/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a showcase product", async () => {
    mockPrisma.showcase_products.delete.mockResolvedValue({ id: 1 });

    const req = new Request("http://localhost/api/landingPage/showcase_products/1", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toContain("موفقیت");
    expect(mockPrisma.showcase_products.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it("should return 500 on error", async () => {
    mockPrisma.showcase_products.delete.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/landingPage/showcase_products/1", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain("خطا");
  });
});

describe("PATCH /api/landingPage/showcase_products/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update the order of a showcase product", async () => {
    const updated = { id: 1, order: 5 };
    mockPrisma.showcase_products.update.mockResolvedValue(updated);

    const req = new Request("http://localhost/api/landingPage/showcase_products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: 5 }),
    });

    const res = await PATCH(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(updated);
    expect(mockPrisma.showcase_products.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { order: 5 },
    });
  });

  it("should return 500 on error", async () => {
    mockPrisma.showcase_products.update.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/landingPage/showcase_products/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: 5 }),
    });

    const res = await PATCH(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain("خطا");
  });
});
