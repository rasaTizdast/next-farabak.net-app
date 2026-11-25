import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUser } from "@/context/UserContext";

import CommentForm from "./CommentForm";

vi.mock("@/context/UserContext", () => ({ useUser: vi.fn() }));
const target = { type: "blog" as const, id: 1 };

describe("CommentForm", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("prompts guests to sign in", () => {
    vi.mocked(useUser).mockReturnValue({ loading: false, user: null, isAdmin: false } as never);
    render(<CommentForm target={target} />);
    expect(screen.getByRole("link", { name: /ورود/ })).toBeInTheDocument();
  });
  it("submits the member's comment and displays a private pending acknowledgement", async () => {
    vi.mocked(useUser).mockReturnValue({
      loading: false,
      user: { firstName: "علی", lastName: "رضایی" },
      isAdmin: false,
    } as never);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true } as Response);
    render(<CommentForm target={target} />);
    fireEvent.change(screen.getByLabelText(/متن دیدگاه/), {
      target: { value: "متن دیدگاه آزمایشی" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ارسال دیدگاه/ }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toEqual({
      target,
      body: "متن دیدگاه آزمایشی",
      mode: "member",
    });
    expect(await screen.findByRole("status")).toHaveTextContent(/بررسی/);
  });
});
