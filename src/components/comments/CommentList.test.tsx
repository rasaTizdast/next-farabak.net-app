import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useUser } from "@/context/UserContext";

import CommentList from "./CommentList";

vi.mock("@/context/UserContext", () => ({ useUser: vi.fn() }));

describe("CommentList", () => {
  it("renders plain text and editorial replies, and loads another page", async () => {
    vi.mocked(useUser).mockReturnValue({ isAdmin: false, user: null } as never);
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ comments: [], nextCursor: null }),
    } as Response);
    render(
      <CommentList
        target={{ type: "blog", id: 1 }}
        initialPage={{
          comments: [
            {
              id: 3,
              displayName: "علی",
              body: "<script>سلام</script>",
              presentation: "MEMBER",
              publishedAt: null,
              replies: [
                {
                  id: 4,
                  displayName: "فرابک",
                  body: "پاسخ",
                  presentation: "EDITORIAL",
                  publishedAt: null,
                },
              ],
            },
          ],
          nextCursor: 3,
        }}
      />
    );
    expect(screen.getByText("<script>سلام</script>")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
    expect(screen.getByText("پاسخ تیم فرابک")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "دیدگاه‌های بیشتر" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/comments/blog/1?cursor=3"));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "دیدگاه‌های بیشتر" })).not.toBeInTheDocument()
    );
  });
});
