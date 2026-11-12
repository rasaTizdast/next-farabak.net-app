import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { editUserHandler } = vi.hoisted(() => ({ editUserHandler: vi.fn() }));

vi.mock("@/helpers/editUserHandler", () => ({ editUserHandler }));
vi.mock("@/context/UserContext", () => ({
  useUser: () => ({
    user: null,
    updateUserContext: vi.fn(),
  }),
}));
vi.mock("@/app/auth/_components/CitySelector", () => ({
  default: ({ name, label }: { name: string; label: string }) => (
    <label>
      {label}
      <input name={name} aria-label={label} />
    </label>
  ),
}));

import EditUser from "./page";

describe("EditUser", () => {
  it("exposes labelled fields and inline validation feedback", async () => {
    render(<EditUser />);

    expect(screen.getByRole("form", { name: "فرم ویرایش اطلاعات" })).toBeVisible();
    expect(screen.getByLabelText("نام")).toBeVisible();
    expect(screen.getByLabelText("آدرس ایمیل")).toHaveAttribute("autocomplete", "email");

    fireEvent.submit(screen.getByRole("form", { name: "فرم ویرایش اطلاعات" }));

    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    });
    expect(editUserHandler).not.toHaveBeenCalled();
  });
});
