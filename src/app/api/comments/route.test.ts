import { beforeEach, describe, expect, it, vi } from "vitest";

import { CommentError } from "@/lib/comments/types";
import { makeApiRequest } from "@/test/api-test-utils";

const context = await vi.hoisted(async () => {
  const { createApiTestContext } = await import("@/test/api-test-utils");
  process.env.JWT_SECRET = "test-secret";
  process.env.BASE_URL = "https://farabak.net";
  return {
    auth: createApiTestContext(),
    service: { submitComment: vi.fn() },
  };
});

vi.mock("next/headers", () => context.auth.mockNextHeaders());
vi.mock("jose", () => context.auth.mockJose());
vi.mock("@/lib/comments/service", () => context.service);

import { POST } from "./route";

const validSubmission = {
  target: { type: "blog", id: 7 },
  body: "پرسش درباره نصب دوربین",
  mode: "member",
};
const origin = { Origin: "https://farabak.net" };

beforeEach(() => {
  context.auth.resetAll();
  context.service.submitComment.mockReset().mockResolvedValue({ id: 25, status: "PENDING" });
});

describe("POST /api/comments", () => {
  it("requires a signed-in account", async () => {
    const response = await POST(
      makeApiRequest("POST", "https://farabak.net/api/comments", validSubmission, origin)
    );
    expect(response.status).toBe(401);
    expect(context.service.submitComment).not.toHaveBeenCalled();
  });

  it.each([undefined, "https://attacker.example"])(
    "rejects missing or foreign Origin before reading the body (%s)",
    async (value) => {
      context.auth.setupAuth("Public", { userId: "18" });
      const request = makeApiRequest("POST", "https://farabak.net/api/comments", validSubmission, {
        ...(value ? { Origin: value } : {}),
      });
      const response = await POST(request);
      expect(response.status).toBe(403);
      expect(context.service.submitComment).not.toHaveBeenCalled();
    }
  );

  it("rejects an oversized body with 413 and does not submit it", async () => {
    context.auth.setupAuth("Public", { userId: "18" });
    const request = new Request("https://farabak.net/api/comments", {
      method: "POST",
      headers: { Origin: "https://farabak.net", "Content-Length": "9000" },
      body: "{}",
    });
    const response = await POST(request);
    expect(response.status).toBe(413);
    expect(context.service.submitComment).not.toHaveBeenCalled();
  });

  it("checks Origin before parsing malformed request bodies", async () => {
    context.auth.setupAuth("Public", { userId: "18" });
    const request = new Request("https://farabak.net/api/comments", {
      method: "POST",
      headers: { Origin: "https://attacker.example" },
      body: "{",
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(context.service.submitComment).not.toHaveBeenCalled();
  });

  it("rejects invalid identity and strict-mode fields", async () => {
    context.auth.setupAuth("Public", { userId: "not-a-user" });
    const invalidIdentity = await POST(
      makeApiRequest("POST", "https://farabak.net/api/comments", validSubmission, origin)
    );
    expect(invalidIdentity.status).toBe(401);

    context.auth.setupAuth("Public", { userId: "18" });
    const invalidBody = await POST(
      makeApiRequest(
        "POST",
        "https://farabak.net/api/comments",
        { ...validSubmission, alias: "fake" },
        origin
      )
    );
    expect(invalidBody.status).toBe(400);
    expect(context.service.submitComment).not.toHaveBeenCalled();
  });

  it("returns field-specific validation errors for invalid comment text", async () => {
    context.auth.setupAuth("Public", { userId: "18" });
    const response = await POST(
      makeApiRequest(
        "POST",
        "https://farabak.net/api/comments",
        { ...validSubmission, body: "short" },
        origin
      )
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: { code: "INVALID_REQUEST", fields: { body: expect.any(String) } },
    });
  });

  it("submits a validated comment and returns a no-store pending acknowledgment", async () => {
    context.auth.setupAuth("Public", { userId: "18" });
    const response = await POST(
      makeApiRequest("POST", "https://farabak.net/api/comments", validSubmission, origin)
    );
    expect(response.status).toBe(202);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ id: 25, status: "PENDING" });
    expect(context.service.submitComment).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "member", target: { type: "blog", id: 7 } }),
      18
    );
  });

  it("maps service errors without exposing internal failures", async () => {
    context.auth.setupAuth("Public", { userId: "18" });
    context.service.submitComment.mockRejectedValueOnce(
      new CommentError(429, "RATE_LIMITED", "Wait a moment.")
    );
    const response = await POST(
      makeApiRequest("POST", "https://farabak.net/api/comments", validSubmission, origin)
    );
    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({ error: { code: "RATE_LIMITED" } });
  });
});
