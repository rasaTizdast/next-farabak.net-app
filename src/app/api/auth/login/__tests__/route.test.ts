import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    client: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn() },
}));

vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(function () {
    return {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue("mock-token"),
    };
  }),
}));

import { POST } from "../route";
import bcrypt from "bcryptjs";

const mockedBcrypt = vi.mocked(bcrypt);

function makeLoginRequest(body: any) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user not found", async () => {
    mockPrisma.client.findFirst.mockResolvedValue(null);

    const res = await POST(makeLoginRequest({ username: "nobody", password: "pass" }));
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.message).toContain("نام کاربری");
  });

  it("returns 401 when password array is empty", async () => {
    mockPrisma.client.findFirst.mockResolvedValue({
      UserID: 1,
      Username: "user",
      Role: "Public",
      Password: [],
    });

    const res = await POST(makeLoginRequest({ username: "user", password: "pass" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when password does not match", async () => {
    mockPrisma.client.findFirst.mockResolvedValue({
      UserID: 1,
      Username: "user",
      Role: "Public",
      Password: [{ Password1: "hashed" }],
    });
    mockedBcrypt.compare.mockResolvedValue(false as never);

    const res = await POST(makeLoginRequest({ username: "user", password: "wrong" }));
    expect(res.status).toBe(401);
  });

  it("returns 200 with tokens on successful login", async () => {
    mockPrisma.client.findFirst.mockResolvedValue({
      UserID: 1,
      Username: "admin",
      Role: "Admin",
      Password: [{ Password1: "hashed" }],
    });
    mockedBcrypt.compare.mockResolvedValue(true as never);

    const res = await POST(makeLoginRequest({ username: "admin", password: "correct" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.role).toBe("Admin");
    expect(json.message).toContain("موفقیت");
  });

  it("returns 500 on internal error", async () => {
    mockPrisma.client.findFirst.mockRejectedValue(new Error("DB error"));

    const res = await POST(makeLoginRequest({ username: "admin", password: "pass" }));
    expect(res.status).toBe(500);
  });
});
