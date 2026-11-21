import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

import { getUsdToRialRate } from "./usd2rial";

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(value: unknown) {
  return new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json" },
  });
}

describe("USD exchange rates normalized for Toman pricing", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("CURRENCY_API_KEY", "test-currency-key");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("keeps the BRS USD rate in Toman even when its unit field says Rial", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ currency: [{ symbol: "USD", price: 123_456.9, unit: "IRR" }] })
    );

    await expect(getUsdToRialRate()).resolves.toEqual({ rate: 123_456 });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("api.brsapi.ir");
  });

  it("converts the PriceToDay Rial rate to Toman by dividing by ten", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ currency: [{ symbol: "USD", price: 0 }] }))
      .mockResolvedValueOnce(jsonResponse({ success: true, price: 12_345_678 }));

    await expect(getUsdToRialRate()).resolves.toEqual({ rate: 1_234_567 });
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("priceto.day/v1/latest/irr/usd");
  });

  it("uses the Jahankhahan USD rate directly as Toman after earlier providers fail", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ currency: [{ symbol: "USD", price: 0 }] }))
      .mockResolvedValueOnce(jsonResponse({ success: false, price: 1_234_500 }))
      .mockResolvedValueOnce(jsonResponse({ rates: { dollar: 98_765.4 } }));

    await expect(getUsdToRialRate()).resolves.toEqual({ rate: 98_765 });
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain("nerkh.jahankhahan.shop");
  });

  it.each(["requests", "response bodies"])(
    "bounds stalled %s to five seconds total",
    async (phase) => {
      vi.useFakeTimers();
      vi.spyOn(console, "error").mockImplementation(() => {});
      if (phase === "requests") {
        fetchMock.mockImplementation(() => new Promise(() => {}));
      } else {
        const response = new Response();
        vi.spyOn(response, "json").mockImplementation(() => new Promise(() => {}));
        fetchMock.mockResolvedValue(response);
      }

      const result = getUsdToRialRate();
      await vi.advanceTimersByTimeAsync(5_000);

      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock.mock.calls.every(([, init]) => init?.signal?.aborted)).toBe(true);
      await expect(result).resolves.toEqual({ rate: null });
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it("returns null after transport, invalid JSON, and invalid rate failures without logging secrets", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock
      .mockRejectedValueOnce(new Error("Request failed for ?key=test-currency-key"))
      .mockResolvedValueOnce(new Response("invalid JSON"))
      .mockResolvedValueOnce(jsonResponse({ rates: { dollar: "invalid" } }));

    await expect(getUsdToRialRate()).resolves.toEqual({ rate: null });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(log.mock.calls.flat().map(String).join("\n")).not.toContain("test-currency-key");
  });
});
