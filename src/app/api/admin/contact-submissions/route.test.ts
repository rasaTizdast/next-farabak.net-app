import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany, requireAuth } = vi.hoisted(() => ({
  findMany: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: { contactSubmission: { findMany } },
}));

import { GET } from "./route";

const pageRows = Array.from({ length: 26 }, (_, index) => {
  const id = 100 - index;
  return {
    id,
    name: `Visitor ${id}`,
    phone: "09121234567",
    project: null,
    message: `Inquiry ${id}`,
    createdAt: new Date("2026-11-23T08:00:00.000Z"),
  };
});

function makeRequest(query = "") {
  return new Request(`http://localhost/api/admin/contact-submissions${query}`);
}

describe("GET /api/admin/contact-submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuth.mockResolvedValue({ userId: "7", username: "admin", role: "Admin" });
    findMany.mockResolvedValue([]);
  });

  it("returns 401 and does not query submissions for an unauthenticated visitor", async () => {
    requireAuth.mockResolvedValueOnce(
      NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    );

    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("returns 403 and does not query submissions for a branch user", async () => {
    requireAuth.mockResolvedValueOnce({ userId: "7", username: "branch", role: "Branch" });

    const response = await GET(makeRequest());

    expect(response.status).toBe(403);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("returns only the first 25 newest records and a cursor when more remain", async () => {
    findMany.mockResolvedValueOnce(pageRows);

    const response = await GET(makeRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      items: pageRows.slice(0, 25).map((row) => ({
        ...row,
        createdAt: "2026-11-23T08:00:00.000Z",
      })),
      nextCursor: 76,
    });
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: { id: "desc" },
      take: 26,
      select: {
        id: true,
        name: true,
        phone: true,
        project: true,
        message: true,
        createdAt: true,
      },
    });
  });

  it("uses the last returned ID as an exclusive cursor for the next page", async () => {
    const response = await GET(makeRequest("?cursor=76"));

    expect(response.status).toBe(200);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: { lt: 76 } } }));
  });

  it.each(["abc", "0", "1.5", "-3"])(
    "rejects invalid cursor %s without querying the database",
    async (cursor) => {
      const response = await GET(makeRequest(`?cursor=${cursor}`));

      expect(response.status).toBe(400);
      expect(findMany).not.toHaveBeenCalled();
    }
  );

  it("returns a generic error if the inbox query fails", async () => {
    findMany.mockRejectedValueOnce(new Error("private database detail"));

    const response = await GET(makeRequest());
    const text = await response.text();

    expect(response.status).toBe(500);
    expect(text).not.toContain("private database detail");
  });
});
