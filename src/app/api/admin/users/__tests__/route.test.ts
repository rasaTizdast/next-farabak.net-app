import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCookieStore, mockJwtVerify, mockPrisma } = vi.hoisted(() => ({
  mockCookieStore: new Map<string, string>(),
  mockJwtVerify: vi.fn(),
  mockPrisma: {
    client: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $queryRaw: vi.fn(),
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

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(function () {
    return { $queryRaw: mockPrisma.$queryRaw };
  }),
}));

import { POST, GET } from "../route";

function makePostRequest(body: unknown) {
  return new Request("http://localhost/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 401 when no token", async () => {
    const res = await POST(makePostRequest({ phoneNumber: "09121234567" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when role is not Admin", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Branch" } });

    const res = await POST(makePostRequest({ phoneNumber: "09121234567" }));
    expect(res.status).toBe(401);
  });

  it("searches users by phone number", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Admin" } });
    mockPrisma.client.findMany.mockResolvedValue([{ UserID: 1, PhoneNumber: "09121234567" }]);

    const res = await POST(makePostRequest({ phoneNumber: "09121234567" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveLength(1);
  });

  it("updates user role to Admin by userId", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Admin" } });
    mockPrisma.client.update.mockResolvedValue({ UserID: 2, Role: "Admin" });

    const res = await POST(makePostRequest({ userId: 2 }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.Role).toBe("Admin");
  });

  it("returns 400 when neither phoneNumber nor userId", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Admin" } });

    const res = await POST(makePostRequest({}));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns users without branches", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([
      { UserID: 1, Username: "user1", has_branch: 0 },
      { UserID: 2, Username: "user2", has_branch: 1 },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].Username).toBe("user1");
  });

  it("returns 500 on database error", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});
