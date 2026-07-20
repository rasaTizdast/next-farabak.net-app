import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    client: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    password: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed-password") },
}));

vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(function () {
    return {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue("mock-token"),
    };
  }),
}));

import { POST } from "../route";

function makeSignupRequest(body: any) {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  username: "newuser",
  firstName: "Ali",
  lastName: "Rezaei",
  phoneNumber: "09121234567",
  email: "ali@test.com",
  city: "تهران",
  job: "برنامه‌نویس",
  password: "Pass1234",
};

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeSignupRequest({ username: "onlyuser" }));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.message).toContain("فیلدهای ضروری");
  });

  it("returns 400 when user already exists", async () => {
    mockPrisma.client.findFirst.mockResolvedValue({ UserID: 1 });

    const res = await POST(makeSignupRequest(validBody));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.message).toContain("ثبت شده");
  });

  it("creates user successfully and returns tokens", async () => {
    mockPrisma.client.findFirst.mockResolvedValue(null);
    mockPrisma.client.create.mockResolvedValue({ UserID: 100 });
    mockPrisma.password.create.mockResolvedValue({});

    const res = await POST(makeSignupRequest(validBody));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.message).toContain("موفقیت");
    expect(mockPrisma.client.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.password.create).toHaveBeenCalledTimes(1);
  });

  it("hashes the password before storing", async () => {
    mockPrisma.client.findFirst.mockResolvedValue(null);
    mockPrisma.client.create.mockResolvedValue({ UserID: 100 });
    mockPrisma.password.create.mockResolvedValue({});

    await POST(makeSignupRequest(validBody));

    const passwordCall = mockPrisma.password.create.mock.calls[0][0];
    expect(passwordCall.data.Password1).toBe("hashed-password");
    expect(passwordCall.data.Active).toBe(true);
  });

  it("returns 500 on internal error", async () => {
    mockPrisma.client.findFirst.mockRejectedValue(new Error("DB error"));

    const res = await POST(makeSignupRequest(validBody));
    expect(res.status).toBe(500);
  });
});
