import { Metadata } from "next";

import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";
import { PublicShell } from "@/components/public/PublicShell";

import WarrantyTrackingPage from "./ClientWarrantyTracking";

export const metadata: Metadata = {
  alternates: { canonical: "/support/warranty-tracking" },
  title: "پیگیری گارانتی محصولات فرابک",
  description:
    "وضعیت گارانتی محصولات خود را با وارد کردن کد گارانتی پیگیری کنید. گارانتی معتبر برای تجهیزات امنیتی ریولینک و بلک مجیک. برای اطلاعات بیشتر تماس بگیرید: 021-77500008.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return (
    <PublicShell className="pt-6 pb-12 sm:pt-8 sm:pb-14">
      <PublicBreadcrumbs
        breadcrumbs={["/", "/support", "/support/warranty-tracking"]}
        labels={{ "/support/warranty-tracking": "پیگیری گارانتی" }}
      />
      <WarrantyTrackingPage />
    </PublicShell>
  );
}
