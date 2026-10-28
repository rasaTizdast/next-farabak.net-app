import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/edit-user",
}));

vi.mock("@/context/UserContext", () => ({
  useUser: () => ({
    logout: vi.fn(),
    user: {
      email: "user@example.com",
      firstName: "مریم",
      lastName: "احمدی",
    },
    userFullName: "مریم احمدی",
  }),
}));

import DashboardLayoutContent from "./DashboardLayoutContent";

describe("DashboardLayoutContent", () => {
  it("renders account navigation and identifies the active route", () => {
    render(
      <DashboardLayoutContent>
        <h1>محتوای حساب</h1>
      </DashboardLayoutContent>
    );

    expect(screen.getByRole("navigation", { name: "ناوبری حساب کاربری" })).toBeVisible();
    expect(screen.getByText("مریم احمدی")).toBeVisible();
    expect(screen.getByText("user@example.com")).toBeVisible();
    expect(screen.getByRole("link", { name: "ویرایش اطلاعات" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "تغییر کلمه عبور" })).toHaveAttribute(
      "href",
      "/dashboard/change-password"
    );
    expect(screen.getByRole("link", { name: "ویرایش اطلاعات" })).toHaveClass(
      "motion-reduce:transition-none"
    );
  });
});
