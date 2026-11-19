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
});
