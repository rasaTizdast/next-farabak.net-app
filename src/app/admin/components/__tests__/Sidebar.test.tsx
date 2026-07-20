import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockLogout = vi.fn();

vi.mock("@/context/UserContext", () => ({
  useUser: () => mockUseUser(),
}));

let mockUserState: any = null;
function mockUseUser() {
  return {
    user: mockUserState,
    logout: mockLogout,
    isLoggedIn: !!mockUserState,
    isAdmin: mockUserState?.role?.toLowerCase() === "admin",
    isBranch: mockUserState?.role?.toLowerCase() === "branch",
  };
}

import Sidebar from "../Sidebar";

describe("Sidebar - Admin role", () => {
  beforeEach(() => {
    mockUserState = {
      userId: "1",
      username: "admin",
      role: "Admin",
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      phoneNumber: "09120000000",
    };
    vi.clearAllMocks();
  });

  it("renders admin menu items", () => {
    render(<Sidebar />);

    expect(screen.getByText("داشبورد")).toBeDefined();
    expect(screen.getByText("محصولات")).toBeDefined();
    expect(screen.getByText("قیمت‌های همکار")).toBeDefined();
    expect(screen.getByText("دسته‌بندی‌ها")).toBeDefined();
    expect(screen.getByText("صفحات")).toBeDefined();
    expect(screen.getByText("گزارش‌ها")).toBeDefined();
    expect(screen.getByText("شعبه‌ها")).toBeDefined();
    expect(screen.getByText("انبارها")).toBeDefined();
    expect(screen.getByText("فاکتورها")).toBeDefined();
    expect(screen.getByText("تنظیمات")).toBeDefined();
  });

  it("does NOT render branch-only menu items for admin", () => {
    render(<Sidebar />);
    // "شعبه من" is branch-only
    expect(screen.queryByText("شعبه من")).toBeNull();
  });

  it("shows 'مدیریت' title for admin", () => {
    render(<Sidebar />);
    expect(screen.getByText("مدیریت")).toBeDefined();
  });

  it("renders correct links for admin items", () => {
    render(<Sidebar />);
    const productsLink = screen.getByText("محصولات").closest("a");
    expect(productsLink?.getAttribute("href")).toBe("/admin/products");

    const settingsLink = screen.getByText("تنظیمات").closest("a");
    expect(settingsLink?.getAttribute("href")).toBe("/admin/settings");

    const branchesLink = screen.getByText("شعبه‌ها").closest("a");
    expect(branchesLink?.getAttribute("href")).toBe("/admin/branches");
  });
});

describe("Sidebar - Branch role", () => {
  beforeEach(() => {
    mockUserState = {
      userId: "2",
      username: "branchuser",
      role: "Branch",
      firstName: "Branch",
      lastName: "User",
      email: "branch@test.com",
      phoneNumber: "09120000001",
    };
    vi.clearAllMocks();
  });

  it("renders branch menu items only", () => {
    render(<Sidebar />);

    expect(screen.getByText("شعبه من")).toBeDefined();
    expect(screen.getByText("قیمت‌های همکار")).toBeDefined();
  });

  it("does NOT render admin-only menu items", () => {
    render(<Sidebar />);

    expect(screen.queryByText("داشبورد")).toBeNull();
    expect(screen.queryByText("محصولات")).toBeNull();
    expect(screen.queryByText("دسته‌بندی‌ها")).toBeNull();
    expect(screen.queryByText("صفحات")).toBeNull();
    expect(screen.queryByText("گزارش‌ها")).toBeNull();
    expect(screen.queryByText("انبارها")).toBeNull();
    expect(screen.queryByText("فاکتورها")).toBeNull();
    expect(screen.queryByText("تنظیمات")).toBeNull();
  });

  it("shows 'پنل شعبه' title for branch", () => {
    render(<Sidebar />);
    expect(screen.getByText("پنل شعبه")).toBeDefined();
  });

  it("renders correct links for branch items", () => {
    render(<Sidebar />);
    const myBranchLink = screen.getByText("شعبه من").closest("a");
    expect(myBranchLink?.getAttribute("href")).toBe("/admin/branches/my");

    const partnerPricesLink = screen.getByText("قیمت‌های همکار").closest("a");
    expect(partnerPricesLink?.getAttribute("href")).toBe("/admin/branches/my/partner-prices");
  });
});

describe("Sidebar - Common elements", () => {
  beforeEach(() => {
    mockUserState = {
      userId: "1",
      username: "admin",
      role: "Admin",
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      phoneNumber: "09120000000",
    };
    vi.clearAllMocks();
  });

  it("renders back to website link", () => {
    render(<Sidebar />);
    const backLink = screen.getByText("برگشت به سایت").closest("a");
    expect(backLink?.getAttribute("href")).toBe("/");
  });

  it("renders logout button", () => {
    render(<Sidebar />);
    expect(screen.getByText("خروج")).toBeDefined();
  });

  it("calls logout when logout button is clicked", async () => {
    render(<Sidebar />);
    const logoutButton = screen.getByText("خروج");
    logoutButton.click();
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
