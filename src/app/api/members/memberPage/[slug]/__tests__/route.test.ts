import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    members: {
      findUnique: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/members/memberPage/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return member by slug", async () => {
    const mockMember = { Membersid: 1, Name: "Ali", Slug: "ali-dev" };
    mockPrisma.members.findUnique.mockResolvedValue(mockMember);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "ali-dev" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockMember);
    expect(mockPrisma.members.findUnique).toHaveBeenCalledWith({
      where: { Slug: "ali-dev" },
    });
  });

  it("should return 404 when member not found", async () => {
    mockPrisma.members.findUnique.mockResolvedValue(null);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "not-found" }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("Member not found");
  });

  it("should return 500 on error", async () => {
    mockPrisma.members.findUnique.mockRejectedValue(new Error("DB error"));

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "ali-dev" }),
    });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Internal server error");
  });
});
