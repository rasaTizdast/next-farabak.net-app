import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, requireAuth } = vi.hoisted(() => ({
  prisma: {
    branch: { findFirst: vi.fn(), findUnique: vi.fn() },
    branchproduct: { findFirst: vi.fn() },
    $queryRaw: vi.fn(),
  },
  requireAuth: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/auth", () => ({ requireAuth }));

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  requireAuth.mockResolvedValue({ userId: 41, role: "Branch" });
});

describe("branch stock lookup", () => {
  it("uses the dashboard owner association and returns owned stock", async () => {
    prisma.branch.findFirst.mockResolvedValue({ branchid: 8, name: "QA branch", location: null });
    prisma.branchproduct.findFirst.mockResolvedValue({ quantity: 3 });
    const response = await GET(
      new Request("http://localhost/api/admin/branches/my/stock?productId=12")
    );
    expect(response.status).toBe(200);
    expect(prisma.branch.findFirst).toHaveBeenCalledWith({ where: { UserID: 41 } });
    expect(prisma.branchproduct.findFirst).toHaveBeenCalledWith({
      where: { branchid: 8, ProductId: 12 },
    });
    expect(await response.json()).toMatchObject({ branchid: 8, hasStock: true, quantity: 3 });
  });

  it("returns 404 for an owner with no branch", async () => {
    prisma.branch.findFirst.mockResolvedValue(null);
    const response = await GET(
      new Request("http://localhost/api/admin/branches/my/stock?productId=12")
    );
    expect(response.status).toBe(404);
    expect(prisma.branchproduct.findFirst).not.toHaveBeenCalled();
  });
});
