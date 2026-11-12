import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("GET /api/exchangeRate", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.resetModules();
    const { GET } = await import("../route");
    // Make GET available in tests via a shared variable
    (globalThis as any).__exchangeRateGET = GET;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches and returns USD exchange rate", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        currency: [
          { symbol: "USD", price: "580000" },
          { symbol: "EUR", price: "630000" },
        ],
      }),
    });

    vi.setSystemTime(new Date("2025-06-01T12:00:00Z"));

    const res = await (globalThis as any).__exchangeRateGET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.rate).toBe(580000);
  });

  it("returns the current rate on repeated requests", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        currency: [{ symbol: "USD", price: "580000" }],
      }),
    });

    const GET = (globalThis as any).__exchangeRateGET;
    vi.setSystemTime(new Date("2025-06-01T12:00:00Z"));
    await GET();

    vi.setSystemTime(new Date("2025-06-01T12:30:00Z"));
    const res = await GET();
    const json = await res.json();

    expect(json.rate).toBe(580000);
    // Hour-scoped caching is owned by Next's `use cache` layer (cacheLife
    // stale:60/revalidate:60/expire:3600 in usd2rial.ts) and does not run
    // inside Vitest, so every request refetches from the (mocked) upstream.
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("returns the latest rate when the upstream value changes", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ currency: [{ symbol: "USD", price: "580000" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ currency: [{ symbol: "USD", price: "590000" }] }),
      });

    const GET = (globalThis as any).__exchangeRateGET;
    vi.setSystemTime(new Date("2025-06-01T12:00:00Z"));
    await GET();

    vi.setSystemTime(new Date("2025-06-01T13:01:00Z"));
    const res = await GET();
    const json = await res.json();

    expect(json.rate).toBe(590000);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("falls back to priceto.day when BRS returns zero prices", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ currency: [{ symbol: "USD", price: 0 }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, price: 2638000, time: "2026-10-17T11:46:23.000Z" }),
      });

    vi.setSystemTime(new Date("2026-10-17T12:00:00Z"));
    const res = await (globalThis as any).__exchangeRateGET();
    expect(res.status).toBe(200);

    const json = await res.json();
    // priceto.day prices are in rial and must be converted to toman
    expect(json.rate).toBe(263800);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("falls back to the last provider when earlier providers fail", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, statusText: "Bad Gateway" })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ rates: { dollar: 263500 } }),
      });

    vi.setSystemTime(new Date("2026-10-17T12:00:00Z"));
    const res = await (globalThis as any).__exchangeRateGET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.rate).toBe(263500);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("returns 500 when API response is not ok", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
    });

    vi.setSystemTime(new Date("2025-06-01T12:00:00Z"));
    const res = await (globalThis as any).__exchangeRateGET();
    expect(res.status).toBe(500);
  });

  it("returns 500 when USD rate is missing from response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ currency: [{ symbol: "EUR", price: "630000" }] }),
    });

    vi.setSystemTime(new Date("2025-06-01T12:00:00Z"));
    const res = await (globalThis as any).__exchangeRateGET();
    expect(res.status).toBe(500);
  });

  it("returns 500 when fetch throws an error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    vi.setSystemTime(new Date("2025-06-01T12:00:00Z"));
    const res = await (globalThis as any).__exchangeRateGET();
    expect(res.status).toBe(500);
  });
});
