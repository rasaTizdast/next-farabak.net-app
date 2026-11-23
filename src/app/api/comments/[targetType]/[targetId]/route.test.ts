import { beforeEach, describe, expect, it, vi } from "vitest";

import { CommentError } from "@/lib/comments/types";

const comments = vi.hoisted(() => ({
  listApprovedComments: vi.fn(),
}));

vi.mock("@/lib/comments/queries", () => comments);

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  comments.listApprovedComments.mockResolvedValue({
    comments: [
      {
        id: 5,
        displayName: "علی رضایی",
        body: "پرسش درباره نصب",
        presentation: "MEMBER",
        publishedAt: "2026-11-23T10:00:00.000Z",
        replies: [],
      },
    ],
    nextCursor: null,
  });
});

const params = (targetType: string, targetId: string) => ({
  params: Promise.resolve({ targetType, targetId }),
});

describe("GET /api/comments/:targetType/:targetId", () => {
  it("returns the approved-only public projection without private cache headers", async () => {
    const response = await GET(
      new Request("https://farabak.net/api/comments/blog/7?cursor=4"),
      params("blog", "7")
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      comments: [
        {
          id: 5,
          displayName: "علی رضایی",
          body: "پرسش درباره نصب",
          presentation: "MEMBER",
          publishedAt: "2026-11-23T10:00:00.000Z",
          replies: [],
        },
      ],
      nextCursor: null,
    });
    expect(comments.listApprovedComments).toHaveBeenCalledWith({ type: "blog", id: 7 }, 4);
  });

  it.each([
    ["unsupported target", "user", "7", ""],
    ["invalid ID", "blog", "0", ""],
    ["invalid cursor", "blog", "7", "?cursor=abc"],
    ["duplicate cursor", "blog", "7", "?cursor=1&cursor=2"],
  ])("rejects %s", async (_name, targetType, targetId, query) => {
    const response = await GET(
      new Request(`https://farabak.net/api/comments/${targetType}/${targetId}${query}`),
      params(targetType, targetId)
    );
    expect(response.status).toBe(400);
    expect(comments.listApprovedComments).not.toHaveBeenCalled();
  });

  it("maps a private or missing target to 404", async () => {
    comments.listApprovedComments.mockRejectedValueOnce(
      new CommentError(404, "TARGET_NOT_FOUND", "The target is unavailable.")
    );
    const response = await GET(
      new Request("https://farabak.net/api/comments/product/7"),
      params("product", "7")
    );
    expect(response.status).toBe(404);
  });
});
