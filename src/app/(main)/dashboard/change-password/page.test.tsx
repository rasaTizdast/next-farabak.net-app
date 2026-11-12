import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { changePasswordHandler } = vi.hoisted(() => ({ changePasswordHandler: vi.fn() }));

vi.mock("@/helpers/changePasswordHandler", () => ({ changePasswordHandler }));
vi.mock("@/context/UserContext", () => ({
  useUser: () => ({}),
}));

import ChangePassword from "./page";

describe("ChangePassword", () => {
  it("keeps password-manager metadata and reports validation inline", async () => {
    render(<ChangePassword />);

    const form = screen.getByRole("form", { name: "فرم تغییر کلمه عبور" });
    expect(screen.getByLabelText("کلمه عبور قبلی")).toHaveAttribute(
      "autocomplete",
      "current-password"
    );
    expect(screen.getByLabelText("کلمه عبور جدید")).toHaveAttribute("autocomplete", "new-password");

    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    });
    expect(changePasswordHandler).not.toHaveBeenCalled();
  });
});
