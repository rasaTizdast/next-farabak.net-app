import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import AnalyticsOverview from "./page";

const originalAnalyticsUrl = process.env.NEXT_PUBLIC_UMAMI_ANALYTICS_PAGE;

afterEach(() => {
  cleanup();
  if (originalAnalyticsUrl === undefined) {
    delete process.env.NEXT_PUBLIC_UMAMI_ANALYTICS_PAGE;
  } else {
    process.env.NEXT_PUBLIC_UMAMI_ANALYTICS_PAGE = originalAnalyticsUrl;
  }
});

describe("admin analytics overview", () => {
  it("opens a configured analytics dashboard in a protected new tab", () => {
    process.env.NEXT_PUBLIC_UMAMI_ANALYTICS_PAGE = "https://analytics.example.com/site/overview";

    render(<AnalyticsOverview />);

    const link = screen.getByRole("link", { name: /مشاهده تحلیل‌های دقیق‌تر/ });
    expect(link).toHaveAttribute("href", "https://analytics.example.com/site/overview");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it.each(["javascript:alert(1)", "data:text/html,unsafe", "//analytics.example.com/site"])(
    "does not render an external link for an unsafe or incomplete URL: %s",
    (url) => {
      process.env.NEXT_PUBLIC_UMAMI_ANALYTICS_PAGE = url;

      render(<AnalyticsOverview />);

      expect(
        screen.queryByRole("link", { name: /مشاهده تحلیل‌های دقیق‌تر/ })
      ).not.toBeInTheDocument();
      expect(screen.getByText("پیوند پنل تحلیلی تنظیم نشده است.")).toBeInTheDocument();
    }
  );

  it("keeps the overview available when no external dashboard is configured", () => {
    delete process.env.NEXT_PUBLIC_UMAMI_ANALYTICS_PAGE;

    render(<AnalyticsOverview />);

    expect(screen.getByRole("heading", { level: 1, name: "تحلیل وبسایت شما" })).toBeInTheDocument();
    expect(screen.getByText("پیوند پنل تحلیلی تنظیم نشده است.")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(4);
  });
});
