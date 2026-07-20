import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockJwtVerify } = vi.hoisted(() => ({
  mockJwtVerify: vi.fn(),
}));

vi.mock("jose", () => ({
  jwtVerify: (...args: any[]) => mockJwtVerify(...args),
  SignJWT: vi.fn().mockImplementation(function () {
    return {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue("new-access-token"),
    };
  }),
}));

import { POST } from "../route";

function makeRefreshRequest(body?: any, headers?: Record<string, string>) {
  return new Request("http://localhost/api/auth/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("POST /api/auth/refresh-token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when no refresh token provided", async () => {
    const res = await POST(makeRefreshRequest({}));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.message).toContain("بازیابی");
  });

  it("returns 401 when refresh token is invalid", async () => {
    mockJwtVerify.mockRejectedValue(new Error("Invalid token"));

    const res = await POST(makeRefreshRequest({ refreshToken: "invalid-token" }));
    expect(res.status).toBe(401);
  });

  it("returns 200 with new access token on valid refresh token", async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { userId: "1", username: "admin", role: "Admin" },
    });

    const res = await POST(makeRefreshRequest({ refreshToken: "valid-refresh-token" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.accessToken).toBe("new-access-token");
    expect(json.success).toBe(true);
    expect(json.user.role).toBe("Admin");
  });

  it("returns 401 on unexpected token error", async () => {
    mockJwtVerify.mockImplementation(() => {
      throw "unexpected";
    });

    const res = await POST(makeRefreshRequest({ refreshToken: "token" }));
    expect(res.status).toBe(401);
  });
});
