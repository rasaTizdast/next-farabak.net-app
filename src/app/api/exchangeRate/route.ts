import { NextResponse } from "next/server";

import { getUsdToRialRate } from "@/lib/data/usd2rial";

/**
 * GET handler for the exchange rate API.
 * Delegates to the cached `getUsdToRialRate` data function (cacheLife
 * stale:60 / revalidate:60 / expire:3600, tag `TAGS.exchangeRate`) so the
 * route does not perform an uncached fetch during prerendering.
 */
export async function GET() {
  try {
    const { rate } = await getUsdToRialRate();

    if (rate === null) {
      return NextResponse.json({ error: "خطا در دریافت نرخ ارز" }, { status: 500 });
    }

    return NextResponse.json({ rate });
  } catch (error) {
    console.error("خطا در API نرخ ارز:", error);
    return NextResponse.json({ error: "خطا در دریافت نرخ ارز" }, { status: 500 });
  }
}
