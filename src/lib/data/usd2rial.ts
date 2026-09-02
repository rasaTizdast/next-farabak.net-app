import { cachedQuery } from "./cache";
import { TAGS } from "./tags";

const EXCHANGE_RATE_API_URL = "https://api.brsapi.ir/Market/Gold_Currency.php";

export interface UsdRateResult {
  rate: number | null;
}

async function fetchExchangeRateFromApi(): Promise<UsdRateResult> {
  try {
    const response = await fetch(`${EXCHANGE_RATE_API_URL}?key=${process.env.CURRENCY_API_KEY}`, {
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`خطا در دریافت اطلاعات: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      currency: { symbol: string; price: string | number }[];
    };
    const usdRate = data.currency.find((item) => item.symbol === "USD")?.price;

    if (!usdRate) {
      throw new Error("نرخ دلار در پاسخ دریافتی یافت نشد");
    }

    return { rate: Number(usdRate) };
  } catch (error) {
    console.error("خطا در دریافت نرخ ارز:", error);
    // Graceful fallback — never throw a network error into a static/ISR build.
    return { rate: null };
  }
}

/**
 * Server-side USD → IRR exchange rate.
 * Replaces the internal `/api/exchangeRate` hop for Server Components: a direct
 * external fetch, cached ~1h (`revalidate: 3600`, tag `TAGS.exchangeRate`).
 * On any failure it returns `{ rate: null }`, which mirrors the `null` fallback
 * callers of `fetchUsdToRialRate`/`calculateProductPricing` already tolerate.
 */
export const getUsdToRialRate = cachedQuery("getUsdToRialRate", fetchExchangeRateFromApi, {
  revalidate: 3600,
  tags: [TAGS.exchangeRate],
});
