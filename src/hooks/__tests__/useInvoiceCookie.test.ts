import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useInvoiceCookie } from "../useInvoiceCookie";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useInvoiceCookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with loading false and no error", () => {
    const { result } = renderHook(() => useInvoiceCookie());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("saveInvoiceToCookie returns result on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useInvoiceCookie());
    let response;
    await act(async () => {
      response = await result.current.saveInvoiceToCookie({
        products: [{ ProductId: 1, Quantity: 2, ProductName: "Test" }],
        TotalAmount: 2,
      });
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/invoice/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: [{ ProductId: 1, Quantity: 2, ProductName: "Test" }],
        TotalAmount: 2,
      }),
    });
    expect(response).toEqual({ success: true });
  });

  it("getInvoiceFromCookie returns data on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { products: [], TotalAmount: 0 } }),
    });

    const { result } = renderHook(() => useInvoiceCookie());
    let data;
    await act(async () => {
      data = await result.current.getInvoiceFromCookie();
    });

    expect(data).toEqual({ products: [], TotalAmount: 0 });
  });

  it("getInvoiceFromCookie returns null on 404", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not found" }),
    });

    const { result } = renderHook(() => useInvoiceCookie());
    let data;
    await act(async () => {
      data = await result.current.getInvoiceFromCookie();
    });

    expect(data).toBeNull();
  });

  it("clearInvoiceCookie calls clear endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useInvoiceCookie());
    await act(async () => {
      await result.current.clearInvoiceCookie();
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/invoice/clear", {
      method: "POST",
    });
  });

  it("tracks loading state", async () => {
    mockFetch.mockImplementationOnce(async () => {
      await new Promise((r) => setTimeout(r, 50));
      return {
        ok: true,
        json: async () => ({ success: true }),
      };
    });

    const { result } = renderHook(() => useInvoiceCookie());
    expect(result.current.isLoading).toBe(false);

    let savePromise: Promise<any>;
    act(() => {
      savePromise = result.current.saveInvoiceToCookie({
        products: [],
        TotalAmount: 0,
      });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await savePromise;
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
