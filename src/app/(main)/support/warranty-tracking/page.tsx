import { Metadata } from "next";

import { cn } from "@/lib/utils";

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
    <div className={cn("w-full")}>
      <WarrantyTrackingPage />
    </div>
  );
}
