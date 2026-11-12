import bcrypt from "bcryptjs";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCookieStore, mockJwtVerify, mockPrisma } = vi.hoisted(() => ({
  mockCookieStore: new Map<string, string>(),
  mockJwtVerify: vi.fn(),
  mockPrisma: {
    password: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const val = mockCookieStore.get(name);
      return val ? { value: val } : undefined;
    },
  })),
}));

vi.mock("jose", () => ({
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn(), hash: vi.fn() },
}));

import { PATCH } from "../route";

const mockedBcrypt = vi.mocked(bcrypt);

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/auth/change-password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/auth/change-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 401 when no token is provided", async () => {
    const res = await PATCH(makeRequest({ currentPassword: "old", newPassword: "new" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when active password not found", async () => {
    mockCookieStore.set("accessToken", "valid-token");
    mockJwtVerify.mockResolvedValue({ payload: { userId: "1" } });
    mockPrisma.password.findFirst.mockResolvedValue(null);

    const res = await PATCH(makeRequest({ currentPassword: "old", newPassword: "new12345" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when current password does not match", async () => {
    mockCookieStore.set("accessToken", "valid-token");
    mockJwtVerify.mockResolvedValue({ payload: { userId: "1" } });
    mockPrisma.password.findFirst.mockResolvedValue({ Password1: "hashed-old" });
    mockedBcrypt.compare.mockResolvedValue(false as never);

    const res = await PATCH(makeRequest({ currentPassword: "wrong", newPassword: "new12345" }));
    expect(res.status).toBe(401);
  });

  it("changes password successfully", async () => {
    mockCookieStore.set("accessToken", "valid-token");
    mockJwtVerify.mockResolvedValue({ payload: { userId: "1" } });
    mockPrisma.password.findFirst.mockResolvedValue({ Password1: "hashed-old" });
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedBcrypt.hash.mockResolvedValue("hashed-new" as never);
    mockPrisma.password.updateMany.mockResolvedValue({});
    mockPrisma.password.create.mockResolvedValue({});

    const res = await PATCH(makeRequest({ currentPassword: "old", newPassword: "new12345" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.message).toContain("موفقیت");
  });

  it("returns 500 on internal error", async () => {
    mockCookieStore.set("accessToken", "valid-token");
    mockJwtVerify.mockRejectedValue(new Error("token error"));

    const res = await PATCH(makeRequest({ currentPassword: "old", newPassword: "new" }));
    expect(res.status).toBe(500);
  });
});
