import { NextResponse } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockJwtVerify } = vi.hoisted(() => ({
  mockJwtVerify: vi.fn(),
}));

vi.mock("jose", () => ({
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name === "accessToken" ? { value: "test-token", name: "accessToken" } : undefined,
    has: vi.fn(),
    size: 0,
    [Symbol.iterator]: vi.fn(),
    getAll: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

import { verifyToken, verifyTokenFromCookieHeader, requireAuth } from "@/lib/auth";

describe("src/lib/auth.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("verifyToken", () => {
    it("throws when no token provided", async () => {
      await expect(verifyToken(undefined)).rejects.toThrow("No token provided");
    });

    it("returns payload when token is valid", async () => {
      mockJwtVerify.mockResolvedValue({
        payload: { userId: "1", username: "test", role: "Admin" },
      });

      const result = await verifyToken("valid-token");
      expect(result).toEqual({ userId: "1", username: "test", role: "Admin" });
    });

    it("throws when token verification fails", async () => {
      mockJwtVerify.mockRejectedValue(new Error("Invalid token"));
      await expect(verifyToken("bad-token")).rejects.toThrow();
    });

    it("propagates expired-token errors from jose", async () => {
      const err = new Error("exp");
      err.name = "JWTExpired";
      (err as { code?: string }).code = "ERR_JWT_EXPIRED";
      mockJwtVerify.mockRejectedValue(err);
      await expect(verifyToken("expired-token")).rejects.toThrow("exp");
    });

    it("propagates invalid-signature errors from jose", async () => {
      const err = new Error("signature verification failed");
      err.name = "JWSSignatureVerificationFailed";
      (err as { code?: string }).code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
      mockJwtVerify.mockRejectedValue(err);
      await expect(verifyToken("bad-sig-token")).rejects.toThrow("signature verification failed");
    });

    it("propagates malformed-token errors from jose", async () => {
      const err = new Error("Invalid Compact JWS");
      err.name = "JWTMalformed";
      (err as { code?: string }).code = "ERR_JWT_MALFORMED";
      mockJwtVerify.mockRejectedValue(err);
      await expect(verifyToken("malformed")).rejects.toThrow("Invalid Compact JWS");
    });
  });

  describe("verifyTokenFromCookieHeader", () => {
    it("throws when no cookie header", async () => {
      await expect(verifyTokenFromCookieHeader(null)).rejects.toThrow("No cookies provided");
    });

    it("throws when token not found in cookie", async () => {
      await expect(verifyTokenFromCookieHeader("other=value")).rejects.toThrow(
        "No token found in cookies"
      );
    });

    it("extracts and verifies token from cookie header", async () => {
      mockJwtVerify.mockResolvedValue({
        payload: { userId: "1", username: "test", role: "Admin" },
      });

      const result = await verifyTokenFromCookieHeader("token=valid-token; other=value");
      expect(result).toEqual({ userId: "1", username: "test", role: "Admin" });
    });

    it("propagates verification errors from jose", async () => {
      mockJwtVerify.mockRejectedValue(new Error("exp"));
      await expect(verifyTokenFromCookieHeader("token=bad-token")).rejects.toThrow("exp");
    });

    it("throws when token value is empty", async () => {
      await expect(verifyTokenFromCookieHeader("token=")).rejects.toThrow(
        "No token found in cookies"
      );
    });
  });

  describe("requireAuth", () => {
    it("returns 401 when no accessToken cookie", async () => {
      const { cookies } = await import("next/headers");
      vi.mocked(cookies).mockResolvedValueOnce({
        get: (name: string) => (name === "accessToken" ? undefined : undefined),
        has: vi.fn(),
        size: 0,
        [Symbol.iterator]: vi.fn(),
        getAll: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      });

      const result = await requireAuth();
      expect(result).toBeInstanceOf(NextResponse);
      const nextRes = result as NextResponse;
      expect(nextRes.status).toBe(401);
    });

    it("returns 401 when token verification fails", async () => {
      const { cookies } = await import("next/headers");
      vi.mocked(cookies).mockResolvedValueOnce({
        get: (name: string) =>
          name === "accessToken" ? { value: "invalid-token", name: "accessToken" } : undefined,
        has: vi.fn(),
        size: 0,
        [Symbol.iterator]: vi.fn(),
        getAll: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      });
      mockJwtVerify.mockRejectedValue(new Error("Invalid token"));

      const result = await requireAuth();
      expect(result).toBeInstanceOf(NextResponse);
      const nextRes = result as NextResponse;
      expect(nextRes.status).toBe(401);
    });

    it("returns the user object on a valid token", async () => {
      mockJwtVerify.mockResolvedValue({
        payload: { userId: "1", username: "test", role: "Admin" },
      });

      const result = await requireAuth();
      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({ userId: "1", username: "test", role: "Admin" });
    });
  });
});
