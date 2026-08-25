import axios from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { editUserHandler } from "../editUserHandler";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("editUserHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends PATCH request and returns response data", async () => {
    const mockData = { message: "Profile updated" };
    mockedAxios.patch.mockResolvedValue({ data: mockData });

    const result = await editUserHandler({
      f_name: "Ali",
      l_name: "Rezaei",
      phone_number: "09121234567",
    });

    expect(mockedAxios.patch).toHaveBeenCalledWith("/api/auth/profile", {
      f_name: "Ali",
      l_name: "Rezaei",
      phone_number: "09121234567",
    });
    expect(result).toEqual(mockData);
  });

  it("sends only provided fields", async () => {
    mockedAxios.patch.mockResolvedValue({ data: { message: "ok" } });

    await editUserHandler({ f_name: "Ali" });

    expect(mockedAxios.patch).toHaveBeenCalledWith("/api/auth/profile", { f_name: "Ali" });
  });

  it("rejects with axios error response message", async () => {
    const error = {
      response: { data: { message: "Phone number already exists" } },
      isAxiosError: true,
      message: "",
    };
    mockedAxios.patch.mockRejectedValue(error);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(editUserHandler({ phone_number: "09120000000" })).rejects.toBe(
      "Phone number already exists"
    );
  });

  it("rejects with fallback when axios error has no response data", async () => {
    const error = {
      response: { data: {} },
      isAxiosError: true,
      message: "",
    };
    mockedAxios.patch.mockRejectedValue(error);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(editUserHandler({ f_name: "test" })).rejects.toBe("Update profile failed");
  });

  it("rejects with Error instance message", async () => {
    const error = new Error("Connection refused");
    mockedAxios.patch.mockRejectedValue(error);
    mockedAxios.isAxiosError.mockReturnValue(false);

    await expect(editUserHandler({ f_name: "test" })).rejects.toBe("Connection refused");
  });

  it("rejects with unknown error fallback", async () => {
    mockedAxios.patch.mockRejectedValue(42);
    mockedAxios.isAxiosError.mockReturnValue(false);

    await expect(editUserHandler({ f_name: "test" })).rejects.toBe(
      "Update profile failed due to an unknown error"
    );
  });
});
