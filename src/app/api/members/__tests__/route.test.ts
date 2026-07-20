import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    members: {
      findMany: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/members", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return members list", async () => {
    const mockMembers = [
      { Membersid: 1, Name: "Ali", Role: "Developer", Slug: "ali" },
      { Membersid: 2, Name: "Sara", Role: "Designer", Slug: "sara" },
    ];
    mockPrisma.members.findMany.mockResolvedValue(mockMembers);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockMembers);
    expect(mockPrisma.members.findMany).toHaveBeenCalledWith({
      orderBy: { Membersid: "asc" },
    });
  });

  it("should return 404 when members not found", async () => {
    mockPrisma.members.findMany.mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("Members not found");
  });

  it("should return 500 on error", async () => {
    mockPrisma.members.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Internal server error");
  });
});
