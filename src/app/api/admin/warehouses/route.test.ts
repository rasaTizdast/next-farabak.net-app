import { describe, expect, it, vi } from "vitest";

const { queryRaw } = vi.hoisted(() => ({ queryRaw: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: queryRaw } }));
vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 1, role: "Admin" }),
}));

import { GET } from "./route";

describe("warehouse listing", () => {
  it("never deletes inventory while reading the warehouse list", async () => {
    queryRaw.mockImplementation(async (parts: TemplateStringsArray) => {
      const sql = parts.join("");
      if (sql.includes("COUNT(*)")) return [{ total: 0 }];
      return [];
    });
    const response = await GET(new Request("http://localhost/api/admin/warehouses"));
    expect(response.status).toBe(200);
    expect(queryRaw.mock.calls.some(([parts]) => parts.join("").includes("DELETE"))).toBe(false);
  });
});
