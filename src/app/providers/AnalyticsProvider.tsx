"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const url = pathname + searchParams.toString();

    // Send page_view event to GA
    (window as any).gtag?.("config", process.env.GOOGLE_ANALYTICS_ID!, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}
