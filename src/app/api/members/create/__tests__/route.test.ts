import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockS3 } = vi.hoisted(() => ({
  mockPrisma: {
    members: {
      create: vi.fn(),
    },
  },
  mockS3: {
    putObject: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () {
    return mockS3;
  }),
}));

import { POST } from "../route";

function createFormData(fields: Record<string, string | File | null>): Request {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value instanceof File) {
      fd.append(key, value);
    } else if (value !== null) {
      fd.append(key, value);
    }
  }
  return new Request("http://localhost/api/members/create", {
    method: "POST",
    body: fd,
  });
}

describe("POST /api/members/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create member with file", async () => {
    const mockMember = { Membersid: 1, Name: "Ali", Role: "Dev", Slug: "ali" };
    mockPrisma.members.create.mockResolvedValue(mockMember);

    const file = new File(["content"], "avatar.png", { type: "image/png" });
    const req = createFormData({
      name: "Ali",
      role: "Dev",
      desc: "Description",
      phone: "0912",
      slug: "ali",
      file,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockMember);
    expect(mockPrisma.members.create).toHaveBeenCalled();
  });

  it("should create member without file", async () => {
    const mockMember = { Membersid: 1, Name: "Ali", Role: "Dev", Slug: "ali" };
    mockPrisma.members.create.mockResolvedValue(mockMember);

    const req = createFormData({
      name: "Ali",
      role: "Dev",
      desc: "Description",
      phone: "0912",
      slug: "ali",
      file: null,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockMember);
  });

  it("should return 500 on error", async () => {
    mockPrisma.members.create.mockRejectedValue(new Error("DB error"));

    const req = createFormData({
      name: "Ali",
      role: "Dev",
      desc: "Description",
      phone: "0912",
      slug: "ali",
      file: null,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("خطا در ایجاد عضو.");
  });
});
