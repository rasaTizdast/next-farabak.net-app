import type { Metadata } from "next";

import { PublicShell } from "@/components/public/PublicShell";
import { createRouteMetadata } from "@/lib/seo/route-metadata";

import ReportWorkspace from "./ReportWorkspace";

export const metadata: Metadata = {
  ...createRouteMetadata({
    title: "گزارش انتخاب محصول | فرابک",
    description: "گزارش پیشنهادهای ذخیره‌شده در راهنمای انتخاب محصول فرابک.",
    path: "/product-finder/report",
  }),
  title: "گزارش انتخاب محصول | فرابک",
  description: "گزارش پیشنهادهای ذخیره‌شده در راهنمای انتخاب محصول فرابک.",
  robots: { index: false, follow: true },
};

export default function ProductFinderReportPage() {
  return (
    <PublicShell className="py-12">
      <ReportWorkspace />
    </PublicShell>
  );
}
