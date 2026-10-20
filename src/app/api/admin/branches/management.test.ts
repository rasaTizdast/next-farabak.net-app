import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeApiRequest } from "@/test/api-test-utils";

const ctx = await vi.hoisted(async () => {
  const { createApiTestContext } = await import("@/test/api-test-utils");
  process.env.JWT_SECRET = "test-secret";
  return createApiTestContext({ $queryRaw: vi.fn() });
});

vi.mock("next/headers", () => ctx.mockNextHeaders());
vi.mock("jose", () => ctx.mockJose());
vi.mock("@/lib/prisma", () => ctx.mockPrismaModule());

import { DELETE, PUT } from "./[branchId]/route";
import { POST } from "./route";

const query = ctx.mockPrisma.$queryRaw as ReturnType<typeof vi.fn>;
const params = () => ({ params: Promise.resolve({ branchId: "16" }) });
const body = { userId: 41, name: "QA branch", location: "QA16" };

beforeEach(() => {
  ctx.resetAll();
  query.mockReset();
  query.mockResolvedValue([]);
});

describe("branch management authorization", () => {
  for (const role of ["Public", "Branch", "Dealer"]) {
    it.each(["create", "update", "delete"])(
      `rejects ${role} %s before database access`,
      async (operation) => {
        ctx.setupAuth(role);
        const response =
          operation === "create"
            ? await POST(makeApiRequest("POST", "http://localhost/api/admin/branches", body))
            : operation === "update"
              ? await PUT(
                  makeApiRequest("PUT", "http://localhost/api/admin/branches/16", body),
                  params()
                )
              : await DELETE(
                  makeApiRequest("DELETE", "http://localhost/api/admin/branches/16"),
                  params()
                );
        expect(response.status).toBe(403);
        expect(query).not.toHaveBeenCalled();
      }
    );
  }

  it("allows an administrator to create a branch", async () => {
    ctx.setupAuth();
    query
      .mockResolvedValueOnce([{ UserID: 41 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ branchid: 16, ...body }])
      .mockResolvedValueOnce([]);
    const response = await POST(
      makeApiRequest("POST", "http://localhost/api/admin/branches", body)
    );
    expect(response.status).toBe(201);
  });

  it("allows an administrator to update a branch", async () => {
    ctx.setupAuth();
    query
      .mockResolvedValueOnce([{ branchid: 16 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ branchid: 16, ...body }]);
    const response = await PUT(
      makeApiRequest("PUT", "http://localhost/api/admin/branches/16", body),
      params()
    );
    expect(response.status).toBe(200);
  });

  it("allows an administrator to delete a branch", async () => {
    ctx.setupAuth();
    query
      .mockResolvedValueOnce([{ branchid: 16, UserID: 41 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ count: 0 }])
      .mockResolvedValueOnce([]);
    const response = await DELETE(
      makeApiRequest("DELETE", "http://localhost/api/admin/branches/16"),
      params()
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });
});
