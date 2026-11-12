import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
}));

vi.stubGlobal("fetch", mockFetch);

vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(function () {
    return {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue("reset-token"),
    };
  }),
}));

import { POST } from "../route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/forgot-password", () => {
  const originalBaseUrl = process.env.BASE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BASE_URL = "http://localhost:3000";
  });

  afterAll(() => {
    process.env.BASE_URL = originalBaseUrl;
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("ایمیل");
  });

  it("returns 200 when email is sent successfully", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const res = await POST(makeRequest({ email: "test@test.com" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.emailSent).toBe(true);
    expect(json.resetToken).toBe("reset-token");
  });

  it("returns 500 when email sending fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Send failed" }),
    });

    const res = await POST(makeRequest({ email: "test@test.com" }));
    expect(res.status).toBe(500);
  });

  it("returns 500 on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const res = await POST(makeRequest({ email: "test@test.com" }));
    expect(res.status).toBe(500);
  });
});
