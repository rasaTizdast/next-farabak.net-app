import { Metadata } from "next";

import { PublicShell } from "@/components/public/PublicShell";

import WarrantyTrackingPage from "./ClientWarrantyTracking";

export const metadata: Metadata = {
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
    <PublicShell className="pb-16">
      <WarrantyTrackingPage />
    </PublicShell>
  );
}
