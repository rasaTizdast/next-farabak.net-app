import { renderHook, waitFor, act } from "@testing-library/react";
import axios from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useApiFetch } from "../useApiFetch";

vi.mock("axios");
const mockAxiosGet = vi.mocked(axios.get);

describe("useApiFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with loading=false and data=null before fetch", () => {
    mockAxiosGet.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useApiFetch("/api/test"));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("returns data on successful fetch", async () => {
    const mockData = { id: 1, name: "Test Product" };
    mockAxiosGet.mockResolvedValue({ data: mockData, status: 200 });

    const { result } = renderHook(() => useApiFetch("/api/test"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("sets error on failed fetch", async () => {
    mockAxiosGet.mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useApiFetch("/api/test"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Network Error");
  });

  it("sets error from response data message", async () => {
    const error = { response: { data: { message: "Custom API error" } }, message: "" };
    mockAxiosGet.mockRejectedValue(error);

    const { result } = renderHook(() => useApiFetch("/api/test"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Custom API error");
  });

  it("does not fetch when url is null", () => {
    const { result } = renderHook(() => useApiFetch(null));
    expect(result.current.loading).toBe(false);
    expect(mockAxiosGet).not.toHaveBeenCalled();
  });

  it("does not fetch when fetchOnMount is false", () => {
    mockAxiosGet.mockResolvedValue({ data: {}, status: 200 });
    renderHook(() => useApiFetch("/api/test", false));
    expect(mockAxiosGet).not.toHaveBeenCalled();
  });

  it("refetch re-calls the API", async () => {
    const mockData = { id: 1 };
    mockAxiosGet.mockResolvedValue({ data: mockData, status: 200 });

    const { result } = renderHook(() => useApiFetch("/api/test"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAxiosGet).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockAxiosGet).toHaveBeenCalledTimes(2);
  });

  it("sets error on status >= 400", async () => {
    mockAxiosGet.mockResolvedValue({ data: null, status: 404 });

    const { result } = renderHook(() => useApiFetch("/api/test"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("خطا در دریافت اطلاعات");
    expect(result.current.data).toBeNull();
  });
});
