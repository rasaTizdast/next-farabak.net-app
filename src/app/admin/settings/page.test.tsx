import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { search, makeAdmin, demoteAdmin, changePassword, refetchAdmins, toast } = vi.hoisted(() => ({
  search: vi.fn(),
  makeAdmin: vi.fn(),
  demoteAdmin: vi.fn(),
  changePassword: vi.fn(),
  refetchAdmins: vi.fn(),
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("react-hot-toast", () => ({
  default: toast,
  Toaster: () => null,
}));
vi.mock("@/context/UserContext", () => ({ useUser: () => ({ logout: vi.fn() }) }));
vi.mock("@/hooks/useApiFetch", () => ({
  useApiFetch: () => ({
    data: [{ UserID: 1, FirstName: "QA", LastName: "Admin", PhoneNumber: "09120000000" }],
    refetch: refetchAdmins,
  }),
}));
vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: () => ({ mutate: mockMutation }),
}));

function mockMutation(url: string, data: unknown) {
  if (url === "/api/admin/users") {
    return data && typeof data === "object" && "userId" in data
      ? makeAdmin(url, data)
      : search(url, data);
  }
  if (url === "/api/admin/users/admins") return demoteAdmin(url, data);
  if (url === "/api/auth/change-password") return changePassword(url, data);
  return makeAdmin(url, data);
}

import SettingsPage from "./page";

describe("admin settings interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    search.mockResolvedValue([]);
    makeAdmin.mockResolvedValue({ UserID: 2 });
    demoteAdmin.mockResolvedValue({ UserID: 1 });
  });

  it("submits the user search form and trims the phone number", async () => {
    render(<SettingsPage />);
    const phone = screen.getByRole("textbox", { name: "شماره تلفن کاربر" });
    fireEvent.change(phone, { target: { value: " 09120000000 " } });
    fireEvent.submit(phone.closest("form")!);

    await waitFor(() =>
      expect(search).toHaveBeenCalledWith("/api/admin/users", { phoneNumber: "09120000000" })
    );
  });

  it("asks before demoting an admin and only proceeds after confirmation", async () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("button", { name: "تبدیل به کاربر عادی" }));

    expect(screen.getByRole("alertdialog", { name: /تبدیل نقش ادمین/ })).toBeInTheDocument();
    expect(demoteAdmin).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "تأیید و ادامه" }));
    await waitFor(() =>
      expect(demoteAdmin).toHaveBeenCalledWith("/api/admin/users/admins", { userId: 1 })
    );
  });

  it("clears old search results when a retry returns no users", async () => {
    search.mockResolvedValueOnce([
      { UserID: 2, FirstName: "Test", LastName: "User", PhoneNumber: "09121111111" },
    ]);
    search.mockResolvedValueOnce([]);
    render(<SettingsPage />);
    const phone = screen.getByRole("textbox", { name: "شماره تلفن کاربر" });
    const searchButton = screen.getByRole("button", { name: "جستجو" });
    fireEvent.change(phone, { target: { value: "09121111111" } });
    fireEvent.click(searchButton);
    expect(await screen.findByText(/Test User/)).toBeInTheDocument();
    fireEvent.change(phone, { target: { value: "09122222222" } });
    fireEvent.click(screen.getByRole("button", { name: "جستجو" }));
    await waitFor(() => expect(screen.queryByText(/Test User/)).not.toBeInTheDocument());
  });
});
