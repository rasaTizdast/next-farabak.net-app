import axios from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { changePasswordHandler } from "../changePasswordHandler";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("changePasswordHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends PATCH request and returns response data", async () => {
    const mockData = { message: "Password changed successfully" };
    mockedAxios.patch.mockResolvedValue({ data: mockData });

    const result = await changePasswordHandler({
      currentPassword: "old12345",
      newPassword: "new12345",
    });

    expect(mockedAxios.patch).toHaveBeenCalledWith("/api/auth/change-password", {
      currentPassword: "old12345",
      newPassword: "new12345",
    });
    expect(result).toEqual(mockData);
  });

  it("rejects with axios error response message", async () => {
    const error = {
      response: { data: { message: "Current password is incorrect" } },
      isAxiosError: true,
      message: "",
    };
    mockedAxios.patch.mockRejectedValue(error);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(
      changePasswordHandler({ currentPassword: "wrong", newPassword: "new12345" })
    ).rejects.toBe("Current password is incorrect");
  });

  it("rejects with fallback message when axios error has no response data", async () => {
    const error = {
      response: { data: {} },
      isAxiosError: true,
      message: "",
    };
    mockedAxios.patch.mockRejectedValue(error);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(
      changePasswordHandler({ currentPassword: "old", newPassword: "new" })
    ).rejects.toBe("Password reset failed");
  });

  it("rejects with Error instance message", async () => {
    const error = new Error("Network timeout");
    mockedAxios.patch.mockRejectedValue(error);
    mockedAxios.isAxiosError.mockReturnValue(false);

    await expect(
      changePasswordHandler({ currentPassword: "old", newPassword: "new" })
    ).rejects.toBe("Network timeout");
  });

  it("rejects with unknown error fallback", async () => {
    mockedAxios.patch.mockRejectedValue("string error");
    mockedAxios.isAxiosError.mockReturnValue(false);

    await expect(
      changePasswordHandler({ currentPassword: "old", newPassword: "new" })
    ).rejects.toBe("Password reset failed due to an unknown error");
  });
});
