import { beforeEach, describe, expect, it, vi } from "vitest";

import { CommentError } from "@/lib/comments/types";

const context = await vi.hoisted(async () => {
  const { createApiTestContext } = await import("@/test/api-test-utils");
  process.env.JWT_SECRET = "test-secret";
  return {
    auth: createApiTestContext(),
    query: { listAdminComments: vi.fn() },
  };
});

vi.mock("next/headers", () => context.auth.mockNextHeaders());
vi.mock("jose", () => context.auth.mockJose());
vi.mock("@/lib/comments/admin-queries", () => context.query);

import { GET } from "./route";

beforeEach(() => {
  context.auth.resetAll();
  context.query.listAdminComments.mockReset().mockResolvedValue({ comments: [], nextCursor: null });
});

describe("GET /api/admin/comments", () => {
  it("requires an authenticated account", async () => {
    const response = await GET(new Request("https://farabak.net/api/admin/comments"));
    expect(response.status).toBe(401);
    expect(context.query.listAdminComments).not.toHaveBeenCalled();
  });

  it("passes strict filters and actor ID to the database-backed admin query", async () => {
    context.auth.setupAuth("Admin", { userId: "18" });
    const response = await GET(
      new Request(
        "https://farabak.net/api/admin/comments?status=PENDING&targetType=product&cursor=41"
      )
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(context.query.listAdminComments).toHaveBeenCalledWith(18, {
      status: "PENDING",
      targetType: "product",
      cursor: 41,
    });
  });

  it.each(["status=PUBLIC", "targetType=user", "cursor=1.5", "cursor=1&cursor=2", "unknown=x"])(
    "rejects invalid filters (%s)",
    async (query) => {
      context.auth.setupAuth("Admin", { userId: "18" });
      const response = await GET(new Request(`https://farabak.net/api/admin/comments?${query}`));
      expect(response.status).toBe(400);
      expect(context.query.listAdminComments).not.toHaveBeenCalled();
    }
  );

  it("maps a fresh-role denial from the queue query to 403", async () => {
    context.auth.setupAuth("Admin", { userId: "18" });
    context.query.listAdminComments.mockRejectedValueOnce(
      new CommentError(403, "ADMIN_REQUIRED", "Administrator access is required.")
    );
    const response = await GET(new Request("https://farabak.net/api/admin/comments"));
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
