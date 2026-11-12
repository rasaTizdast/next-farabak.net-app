import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/context/UserContext", () => ({
  useUser: () => ({
    loading: false,
    userFullName: "مریم احمدی",
    user: {
      email: "user@example.com",
      phoneNumber: "09120000000",
    },
  }),
}));

import MainDashboardPage from "./page";

describe("MainDashboardPage", () => {
  it("presents account details and task-first actions", () => {
    render(<MainDashboardPage />);

    expect(screen.getByRole("heading", { level: 1, name: /مریم احمدی/ })).toBeVisible();
    expect(screen.getByText("user@example.com")).toBeVisible();
    expect(screen.getByRole("link", { name: "ویرایش اطلاعات" })).toHaveAttribute(
      "href",
      "/dashboard/edit-user"
    );
    expect(screen.getByRole("link", { name: "مدیریت امنیت" })).toHaveAttribute(
      "href",
      "/dashboard/change-password"
    );
  });
});
