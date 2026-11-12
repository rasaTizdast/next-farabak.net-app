import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockJwtVerify } = vi.hoisted(() => ({
  mockJwtVerify: vi.fn(),
}));

vi.mock("jose", () => ({
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
}));

import { POST } from "../route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/auth/verify-reset-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/verify-reset-code", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when fields are missing", async () => {
    const res = await POST(makeRequest({ email: "test@test.com" }));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("الزامی");
  });

  it("returns 400 when token verification fails", async () => {
    mockJwtVerify.mockRejectedValue(new Error("Invalid token"));

    const res = await POST(
      makeRequest({
        email: "test@test.com",
        code: "123456",
        resetToken: "invalid-token",
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when email/code don't match token payload", async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { email: "other@test.com", code: "654321" },
    });

    const res = await POST(
      makeRequest({
        email: "test@test.com",
        code: "123456",
        resetToken: "valid-token",
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 when code is verified successfully", async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { email: "test@test.com", code: "123456" },
    });

    const res = await POST(
      makeRequest({
        email: "test@test.com",
        code: "123456",
        resetToken: "valid-token",
      })
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.valid).toBe(true);
    expect(json.resetToken).toBe("valid-token");
  });

  it("returns 400 on token verification error", async () => {
    mockJwtVerify.mockImplementation(() => {
      throw "unexpected";
    });

    const res = await POST(
      makeRequest({
        email: "test@test.com",
        code: "123456",
        resetToken: "token",
      })
    );
    expect(res.status).toBe(400);
  });
});
