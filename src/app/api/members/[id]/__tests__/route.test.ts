import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockS3 } = vi.hoisted(() => ({
  mockPrisma: {
    members: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
  mockS3: {
    deleteObject: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () { return mockS3; }),
}));

import { GET, DELETE } from "../route";

describe("GET /api/members/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return member by id", async () => {
    const mockMember = { Membersid: 1, Name: "Ali", Slug: "ali" };
    mockPrisma.members.findUnique.mockResolvedValue(mockMember);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockMember);
  });

  it("should return 404 when member not found", async () => {
    mockPrisma.members.findUnique.mockResolvedValue(null);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "999" }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("Member not found");
  });

  it("should return 500 on error", async () => {
    mockPrisma.members.findUnique.mockRejectedValue(new Error("DB error"));

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Internal server error");
  });
});

describe("DELETE /api/members/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete member with image", async () => {
    const member = { Membersid: 1, main_pic: "avatar.png" };
    mockPrisma.members.findFirst.mockResolvedValue(member);
    mockPrisma.members.delete.mockResolvedValue(member);

    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockS3.deleteObject).toHaveBeenCalled();
    expect(mockPrisma.members.delete).toHaveBeenCalled();
  });

  it("should delete member without image", async () => {
    const member = { Membersid: 1, main_pic: null };
    mockPrisma.members.findFirst.mockResolvedValue(member);
    mockPrisma.members.delete.mockResolvedValue(member);

    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockS3.deleteObject).not.toHaveBeenCalled();
  });

  it("should return 404 when member not found", async () => {
    mockPrisma.members.findFirst.mockResolvedValue(null);

    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "999" }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Member not found");
  });

  it("should return 500 on error", async () => {
    mockPrisma.members.findFirst.mockRejectedValue(new Error("DB error"));

    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Error deleting member");
  });
});
