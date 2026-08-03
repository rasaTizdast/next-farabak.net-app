import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { useApiMutation } from "../useApiMutation";

vi.mock("axios");
const mockAxiosPost = vi.mocked(axios.post);
const mockAxiosPut = vi.mocked(axios.put);
const mockAxiosPatch = vi.mocked(axios.patch);
const mockAxiosDelete = vi.mocked(axios.delete);

describe("useApiMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with loading=false and no error", () => {
    const { result } = renderHook(() => useApiMutation());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("calls POST by default on mutate", async () => {
    const mockResponse = { data: { id: 1, name: "Created" } };
    mockAxiosPost.mockResolvedValue({ data: mockResponse.data, status: 201 });

    const { result } = renderHook(() => useApiMutation());

    let returned;
    await act(async () => {
      returned = await result.current.mutate("/api/test", { name: "Test" });
    });

    expect(mockAxiosPost).toHaveBeenCalledWith("/api/test", { name: "Test" });
    expect(returned).toEqual(mockResponse.data);
    expect(result.current.loading).toBe(false);
  });

  it("calls PUT when method is put", async () => {
    mockAxiosPut.mockResolvedValue({ data: { id: 1 }, status: 200 });

    const { result } = renderHook(() => useApiMutation<{ name: string }>("put"));

    await act(async () => {
      await result.current.mutate("/api/test/1", { name: "Updated" });
    });

    expect(mockAxiosPut).toHaveBeenCalledWith("/api/test/1", { name: "Updated" });
  });

  it("calls PATCH when method is patch", async () => {
    mockAxiosPatch.mockResolvedValue({ data: { id: 1 }, status: 200 });

    const { result } = renderHook(() => useApiMutation<{ name: string }>("patch"));

    await act(async () => {
      await result.current.mutate("/api/test/1", { name: "Patched" });
    });

    expect(mockAxiosPatch).toHaveBeenCalledWith("/api/test/1", { name: "Patched" });
  });

  it("calls DELETE with data in config", async () => {
    mockAxiosDelete.mockResolvedValue({ data: { success: true }, status: 200 });

    const { result } = renderHook(() => useApiMutation<{ id: number }>("delete"));

    await act(async () => {
      await result.current.mutate("/api/test/1", { id: 1 });
    });

    expect(mockAxiosDelete).toHaveBeenCalledWith("/api/test/1", { data: { id: 1 } });
  });

  it("sets error on network failure", async () => {
    mockAxiosPost.mockRejectedValue(new Error("Request failed"));

    const { result } = renderHook(() => useApiMutation());

    await act(async () => {
      const res = await result.current.mutate("/api/test", {});
      expect(res).toBeNull();
    });

    expect(result.current.error).toBe("Request failed");
  });

  it("sets error from response data message", async () => {
    const error = { response: { data: { message: "Server error" } }, message: "" };
    mockAxiosPost.mockRejectedValue(error);

    const { result } = renderHook(() => useApiMutation());

    await act(async () => {
      await result.current.mutate("/api/test", {});
    });

    expect(result.current.error).toBe("Server error");
  });

  it("returns null on status >= 400", async () => {
    mockAxiosPost.mockResolvedValue({ data: null, status: 400 });

    const { result } = renderHook(() => useApiMutation());

    let returned;
    await act(async () => {
      returned = await result.current.mutate("/api/test", {});
    });

    expect(returned).toBeNull();
    expect(result.current.error).toBe("خطا در عملیات");
  });

  it("reset clears the error", async () => {
    mockAxiosPost.mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useApiMutation());

    await act(async () => {
      await result.current.mutate("/api/test", {});
    });

    expect(result.current.error).toBe("Failed");

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
  });
});
