import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAuth, queryRaw, findMany, update } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  queryRaw: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAuth }));
vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: queryRaw, client: { findMany, update } } }));

import { GET as getAdmins, POST as demoteAdmin } from "./admins/route";
import { GET as getUsers } from "./route";

describe("admin user management access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires an Admin role before listing users eligible for branch management", async () => {
    requireAuth.mockResolvedValue(new NextResponse(null, { status: 401 }));
    const response = await getUsers();
    expect(response.status).toBe(401);
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("rejects authenticated non-admins from viewing or changing administrator roles", async () => {
    requireAuth.mockResolvedValue({ userId: "7", username: "qa-branch", role: "Branch" });
    const listResponse = await getAdmins();
    const mutationResponse = await demoteAdmin(
      new Request("http://localhost/api/admin/users/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 8 }),
      })
    );

    expect(listResponse.status).toBe(403);
    expect(mutationResponse.status).toBe(403);
    expect(findMany).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("prevents an administrator from demoting their own account", async () => {
    requireAuth.mockResolvedValue({ userId: "8", username: "qa-admin", role: "Admin" });
    const response = await demoteAdmin(
      new Request("http://localhost/api/admin/users/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 8 }),
      })
    );

    expect(response.status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });
});
