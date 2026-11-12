import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/context/UserContext", () => ({
  useUser: () => ({ isAdmin: false, isLoggedIn: false }),
}));

import HamburgerMenu from "../HamburgerMenu";

describe("HamburgerMenu", () => {
  it("is a labelled native control and returns focus after Escape", () => {
    render(<HamburgerMenu categories={[]} />);

    const trigger = screen.getByRole("button", { name: "باز کردن منو" });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(document, { key: "Escape" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
