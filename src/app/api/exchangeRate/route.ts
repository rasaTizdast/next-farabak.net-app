import { NextResponse } from "next/server";

// Enable static rendering for better caching
export const dynamic = "force-static";

// Set revalidation time to 1 hour (3600 seconds)
export const revalidate = 60;

// Cache object to store the exchange rate and timestamp
let cache = {
  rate: null as number | null,
  timestamp: 0,
};

/**
 * Fetch the USD to Rial exchange rate from the external API
 */
async function fetchExchangeRateFromApi() {
  try {
    const response = await fetch(
      `https://BrsApi.ir/Api/Market/Gold_Currency.php?key=${process.env.CURRENCY_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`خطا در دریافت اطلاعات: ${response.statusText}`);
    }

    const data = await response.json();
    const usdRate = data.currency.find(
      (item: any) => item.symbol === "USD"
    )?.price;

    if (!usdRate) {
      throw new Error("نرخ دلار در پاسخ دریافتی یافت نشد");
    }

    return Number(usdRate);
  } catch (error) {
    console.error("خطا در دریافت نرخ ارز:", error);
    throw error;
  }
}

/**
 * GET handler for the exchange rate API
 */
export async function GET() {
  try {
    // Check if we have cached data that's less than 1 hour old
    const now = Date.now();
    const cacheDuration = 3600 * 1000; // 1 hour in milliseconds

    if (cache.rate && now - cache.timestamp < cacheDuration) {
      // Return cached data if it's still valid
      return NextResponse.json({ rate: cache.rate });
    }

    // Fetch fresh data if cache is expired or empty
    const rate = await fetchExchangeRateFromApi();

    // Update cache
    cache.rate = rate;
    cache.timestamp = now;

    return NextResponse.json({ rate });
  } catch (error) {
    console.error("خطا در API نرخ ارز:", error);
    return NextResponse.json(
      { error: "خطا در دریافت نرخ ارز" },
      { status: 500 }
    );
  }
}
