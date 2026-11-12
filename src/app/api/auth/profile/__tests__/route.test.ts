import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCookieStore, mockJwtVerify, mockPrisma } = vi.hoisted(() => ({
  mockCookieStore: new Map<string, string>(),
  mockJwtVerify: vi.fn(),
  mockPrisma: {
    client: {
      findUnique: vi.fn(),
      update: vi.fn(),
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

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { GET, PATCH } from "../route";

describe("GET /api/auth/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 200 with user null when no token is provided", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.user).toBeNull();
  });

  it("returns 200 with user null when token verification fails", async () => {
    mockCookieStore.set("accessToken", "invalid-token");
    mockJwtVerify.mockRejectedValue(new Error("Invalid token"));

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.user).toBeNull();
  });

  it("returns 200 with user null when user is not found", async () => {
    mockCookieStore.set("accessToken", "valid-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 999, username: "ghost", role: "Public" },
    });
    mockPrisma.client.findUnique.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.user).toBeNull();
  });

  it("returns user profile for Admin role", async () => {
    mockCookieStore.set("accessToken", "admin-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });
    mockPrisma.client.findUnique.mockResolvedValue({
      UserID: 1,
      Username: "admin",
      FirstName: "Admin",
      LastName: "User",
      Email: "admin@test.com",
      PhoneNumber: "09120000000",
      Role: "Admin",
    });

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.user.role).toBe("Admin");
    expect(json.user.firstName).toBe("Admin");
    expect(json.user.username).toBe("admin");
  });

  it("returns user profile for Branch role", async () => {
    mockCookieStore.set("accessToken", "branch-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 2, username: "branch1", role: "Branch" },
    });
    mockPrisma.client.findUnique.mockResolvedValue({
      UserID: 2,
      Username: "branch1",
      FirstName: "Branch",
      LastName: "User",
      Email: "branch@test.com",
      PhoneNumber: "09120000001",
      Role: "Branch",
    });

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.user.role).toBe("Branch");
  });
});

describe("PATCH /api/auth/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 401 when no token is provided", async () => {
    const req = new Request("http://localhost/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "New" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when no valid fields are provided", async () => {
    mockCookieStore.set("accessToken", "valid-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });

    const req = new Request("http://localhost/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it("updates profile successfully", async () => {
    mockCookieStore.set("accessToken", "valid-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });
    mockPrisma.client.update.mockResolvedValue({});

    const req = new Request("http://localhost/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "New", lastName: "Name" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.message).toContain("موفقیت");
    expect(mockPrisma.client.update).toHaveBeenCalledTimes(1);
  });
});
