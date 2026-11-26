import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUser } from "@/context/UserContext";

import CommentForm from "./CommentForm";

vi.mock("@/context/UserContext", () => ({ useUser: vi.fn() }));
const target = { type: "blog" as const, id: 1 };

describe("CommentForm", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("hydrates safely when the guest account lookup resolves before the form hydrates", async () => {
    vi.mocked(useUser).mockReturnValue({ loading: true, user: null, isAdmin: false } as never);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<CommentForm target={target} />);

    vi.mocked(useUser).mockReturnValue({ loading: false, user: null, isAdmin: false } as never);
    const recoverableErrors: unknown[] = [];
    const root = hydrateRoot(container, <CommentForm target={target} />, {
      onRecoverableError: (error) => recoverableErrors.push(error),
    });

    await act(async () => {});

    expect(recoverableErrors).toEqual([]);
    expect(container.querySelector("a")?.textContent).toContain("ورود به حساب کاربری");
    await act(async () => root.unmount());
  });

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

  it("associates a short-body error with its textarea and skips the request", async () => {
    vi.mocked(useUser).mockReturnValue({
      loading: false,
      user: { firstName: "علی", lastName: "رضایی" },
      isAdmin: false,
    } as never);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true } as Response);
    render(<CommentForm target={target} />);
    const textarea = screen.getByLabelText(/متن دیدگاه/);
    fireEvent.change(textarea, { target: { value: "🙂".repeat(9) } });
    fireEvent.submit(textarea.closest("form")!);

    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent(/۱۰/);
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea.getAttribute("aria-describedby")?.split(" ")).toContain(error.id);
    expect(textarea).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows 2,000 Unicode code points in a comment body", async () => {
    vi.mocked(useUser).mockReturnValue({
      loading: false,
      user: { firstName: "علی", lastName: "رضایی" },
      isAdmin: false,
    } as never);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true } as Response);
    render(<CommentForm target={target} />);
    const textarea = screen.getByLabelText(/متن دیدگاه/);
    const body = "🙂".repeat(2000);
    fireEvent.change(textarea, { target: { value: body } });

    expect(textarea).toHaveProperty("maxLength", 4000);
    fireEvent.submit(textarea.closest("form")!);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string).body).toBe(body);
  });

  it("caps comment input at 2,000 Unicode code points", () => {
    vi.mocked(useUser).mockReturnValue({
      loading: false,
      user: { firstName: "علی", lastName: "رضایی" },
      isAdmin: false,
    } as never);
    render(<CommentForm target={target} />);
    const textarea = screen.getByLabelText(/متن دیدگاه/);
    fireEvent.change(textarea, { target: { value: "آ".repeat(2001) } });

    expect(textarea).toHaveValue("آ".repeat(2000));
  });

  it("associates a short-alias error with the alias input and skips the request", () => {
    vi.mocked(useUser).mockReturnValue({
      loading: false,
      user: { firstName: "مدیر", lastName: "آزمایشی" },
      isAdmin: true,
    } as never);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true } as Response);
    render(<CommentForm target={target} />);
    fireEvent.click(screen.getByLabelText(/ثبت با نام مستعار/));
    const aliasInput = screen.getByRole("textbox", { name: /نام مستعار/ });
    fireEvent.change(aliasInput, { target: { value: "🙂" } });
    fireEvent.change(screen.getByLabelText(/متن دیدگاه/), {
      target: { value: "متن دیدگاه آزمایشی" },
    });
    fireEvent.submit(aliasInput.closest("form")!);

    expect(screen.getByRole("alert")).toHaveTextContent(/۲/);
    expect(aliasInput).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("caps an alias at 80 Unicode code points", () => {
    vi.mocked(useUser).mockReturnValue({
      loading: false,
      user: { firstName: "مدیر", lastName: "آزمایشی" },
      isAdmin: true,
    } as never);
    render(<CommentForm target={target} />);
    fireEvent.click(screen.getByLabelText(/ثبت با نام مستعار/));
    const aliasInput = screen.getByRole("textbox", { name: /نام مستعار/ });
    fireEvent.change(aliasInput, { target: { value: "🙂".repeat(81) } });

    expect(aliasInput).toHaveValue("🙂".repeat(80));
  });

  it("associates server field errors with the corresponding textarea", async () => {
    vi.mocked(useUser).mockReturnValue({
      loading: false,
      user: { firstName: "علی", lastName: "رضایی" },
      isAdmin: false,
    } as never);
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ error: { fields: { body: "متن دیدگاه را بررسی کنید." } } }),
    } as Response);
    render(<CommentForm target={target} />);
    const textarea = screen.getByLabelText(/متن دیدگاه/);
    fireEvent.change(textarea, { target: { value: "متن دیدگاه آزمایشی" } });
    fireEvent.submit(textarea.closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent("متن دیدگاه را بررسی کنید.");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveFocus();
  });
});
