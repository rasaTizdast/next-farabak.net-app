import { beforeEach, describe, expect, it, vi } from "vitest";

import { CommentError } from "@/lib/comments/types";
import { makeApiRequest } from "@/test/api-test-utils";

const context = await vi.hoisted(async () => {
  const { createApiTestContext } = await import("@/test/api-test-utils");
  process.env.JWT_SECRET = "test-secret";
  process.env.BASE_URL = "https://farabak.net";
  return {
    auth: createApiTestContext(),
    service: { moderateComment: vi.fn() },
  };
});

vi.mock("next/headers", () => context.auth.mockNextHeaders());
vi.mock("jose", () => context.auth.mockJose());
vi.mock("@/lib/comments/service", () => context.service);

import { PATCH } from "./route";

const params = (commentId: string) => ({ params: Promise.resolve({ commentId }) });
const origin = { Origin: "https://farabak.net" };

beforeEach(() => {
  context.auth.resetAll();
  context.service.moderateComment.mockReset().mockResolvedValue(undefined);
});

describe("PATCH /api/admin/comments/:commentId", () => {
  it("requires authentication and a matching Origin before parsing writes", async () => {
    const unauthenticated = await PATCH(
      makeApiRequest(
        "PATCH",
        "https://farabak.net/api/admin/comments/8",
        { decision: "APPROVED" },
        origin
      ),
      params("8")
    );
    expect(unauthenticated.status).toBe(401);

    context.auth.setupAuth("Admin", { userId: "18" });
    const foreignOrigin = await PATCH(
      makeApiRequest(
        "PATCH",
        "https://farabak.net/api/admin/comments/8",
        { decision: "APPROVED" },
        { Origin: "https://evil.example" }
      ),
      params("8")
    );
    expect(foreignOrigin.status).toBe(403);
    expect(context.service.moderateComment).not.toHaveBeenCalled();

    const malformedBody = await PATCH(
      new Request("https://farabak.net/api/admin/comments/8", {
        method: "PATCH",
        headers: { Origin: "https://evil.example" },
        body: "{",
      }),
      params("8")
    );
    expect(malformedBody.status).toBe(403);
  });

  it("rejects malformed IDs and strict request bodies", async () => {
    context.auth.setupAuth("Admin", { userId: "18" });
    const invalidId = await PATCH(
      makeApiRequest(
        "PATCH",
        "https://farabak.net/api/admin/comments/abc",
        { decision: "APPROVED" },
        origin
      ),
      params("abc")
    );
    expect(invalidId.status).toBe(400);

    const invalidBody = await PATCH(
      makeApiRequest(
        "PATCH",
        "https://farabak.net/api/admin/comments/8",
        { decision: "APPROVED", extra: true },
        origin
      ),
      params("8")
    );
    expect(invalidBody.status).toBe(400);
    expect(context.service.moderateComment).not.toHaveBeenCalled();
  });

  it("records an authorized decision and returns no-store acknowledgment", async () => {
    context.auth.setupAuth("Admin", { userId: "18" });
    const response = await PATCH(
      makeApiRequest(
        "PATCH",
        "https://farabak.net/api/admin/comments/8",
        { decision: "REJECTED", note: "نیازمند اصلاح" },
        origin
      ),
      params("8")
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ id: 8, status: "REJECTED" });
    expect(context.service.moderateComment).toHaveBeenCalledWith(
      8,
      "REJECTED",
      18,
      "نیازمند اصلاح"
    );
  });

  it("maps service conflicts to stable error codes", async () => {
    context.auth.setupAuth("Admin", { userId: "18" });
    context.service.moderateComment.mockRejectedValueOnce(
      new CommentError(409, "MODERATION_CONFLICT", "The comment has already been reviewed.")
    );
    const response = await PATCH(
      makeApiRequest(
        "PATCH",
        "https://farabak.net/api/admin/comments/8",
        { decision: "APPROVED" },
        origin
      ),
      params("8")
    );
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ error: { code: "MODERATION_CONFLICT" } });
  });
});
