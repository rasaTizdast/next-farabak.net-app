import { cacheLife, cacheTag } from "next/cache";

import { TAGS } from "./tags";

const BRS_API_URL = "https://api.brsapi.ir/Market/Gold_Currency.php";
const PRICE_TO_DAY_API_URL = "https://api.priceto.day/v1/latest/irr/usd";
const JAHANKHAHAN_API_URL = "https://nerkh.jahankhahan.shop/data/live.json";

const LOOKUP_TIMEOUT_MS = 5_000;
const PROVIDER_TIMEOUT_MS = 2_000;

// Cloudflare-fronted providers (e.g. priceto.day) return 403 for requests
// without a browser-like User-Agent, which is what Next.js server fetch sends.
const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export interface UsdRateResult {
  rate: number | null;
}

function isValidRate(rate: number | null): rate is number {
  return rate !== null && Number.isFinite(rate) && rate > 0;
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    signal,
  });
  signal.throwIfAborted();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

/**
 * BRS API (existing provider, key in CURRENCY_API_KEY).
 * Prices arrive in تومان despite the `unit` field labelling them as ریال —
 * the free tier occasionally returns `price: 0` for every symbol, so zero is
 * treated as "no data" and the next provider is tried.
 */
async function fetchFromBrs(signal: AbortSignal): Promise<number | null> {
  const data = await fetchJson<{
    currency: { symbol: string; price: string | number }[];
  }>(`${BRS_API_URL}?key=${process.env.CURRENCY_API_KEY}`, signal);

  const usdRate = Math.floor(Number(data.currency?.find((item) => item.symbol === "USD")?.price));
  return isValidRate(usdRate) ? usdRate : null;
}

/**
 * priceto.day (keyless). Prices are in ریال (`base: irr`), so the value is
 * divided by 10 to produce تومان. Data is sourced from tgju.org and
 * cross-checked against Bitpin USDT.
 */
async function fetchFromPriceToDay(signal: AbortSignal): Promise<number | null> {
  const data = await fetchJson<{ success?: boolean; price?: string | number }>(
    PRICE_TO_DAY_API_URL,
    signal
  );

  if (!data.success) {
    return null;
  }

  const rate = Math.floor(Number(data.price) / 10);
  return isValidRate(rate) ? rate : null;
}

/** jahankhahan live board (keyless). `rates.dollar` is already in تومان. */
async function fetchFromJahankhahan(signal: AbortSignal): Promise<number | null> {
  const data = await fetchJson<{ rates?: { dollar?: string | number } }>(
    JAHANKHAHAN_API_URL,
    signal
  );

  const rate = Math.floor(Number(data.rates?.dollar));
  return isValidRate(rate) ? rate : null;
}

const RATE_PROVIDERS = [fetchFromBrs, fetchFromPriceToDay, fetchFromJahankhahan];

async function fetchUsdRateFromProviders(): Promise<UsdRateResult> {
  const deadline = performance.now() + LOOKUP_TIMEOUT_MS;

  for (const provider of RATE_PROVIDERS) {
    const remaining = deadline - performance.now();
    if (remaining <= 0) break;

    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const timeoutResult = new Promise<never>((_resolve, reject) => {
      timeout = setTimeout(
        () => {
          controller.abort();
          reject(controller.signal.reason);
        },
        Math.min(PROVIDER_TIMEOUT_MS, remaining)
      );
    });

    try {
      const rate = await Promise.race([provider(controller.signal), timeoutResult]);
      if (performance.now() <= deadline && isValidRate(rate)) {
        return { rate };
      }
    } catch {
      controller.abort();
      console.error("منبع نرخ ارز در دسترس نیست:", provider.name);
    } finally {
      clearTimeout(timeout);
    }
  }

  return { rate: null };
}

/**
 * Server-side USD → Toman exchange rate.
 * Tries each provider in order (BRS → priceto.day → jahankhahan) and returns
 * the first valid rate within five seconds, or `{ rate: null }`.
 * Cached ~1h (`expire: 3600`, tag `TAGS.exchangeRate`). Callers of
 * `fetchUsdToRialRate`/`calculateProductPricing` already tolerate `null`.
 */
export async function getUsdToRialRate(): Promise<UsdRateResult> {
  "use cache";
  cacheTag(TAGS.exchangeRate);
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });

  return fetchUsdRateFromProviders();
}
