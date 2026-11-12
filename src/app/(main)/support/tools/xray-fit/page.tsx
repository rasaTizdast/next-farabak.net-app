import type { Metadata } from "next";

import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";
import { PublicShell } from "@/components/public/PublicShell";

import XraySiteFitTool from "./XraySiteFitTool";

export const metadata: Metadata = {
  alternates: { canonical: "/support/tools/xray-fit" },
  title: "پیش‌بررسی ابعاد و محل نصب ایکس‌ری | فرابک",
  description:
    "ابعاد اقلام، مسیر تحویل و فضای نصب دستگاه ایکس‌ری را ثبت و با مشخصات منتشرشدهٔ مدل‌ها مقایسه کنید؛ خلاصه‌ای برای بازبینی کارشناس آماده کنید.",
};

export default function XrayFitPage() {
  return (
    <PublicShell className="py-8 sm:py-12">
      <PublicBreadcrumbs
        breadcrumbs={["/", "/support", "/support/tools", "/support/tools/xray-fit"]}
        labels={{
          "/support/tools": "ابزارهای پشتیبانی",
          "/support/tools/xray-fit": "بررسی محل نصب ایکس‌ری",
        }}
      />
      <header className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold text-(--farabak-action-blue)">
          برنامه‌ریزی پیش از بازدید
        </p>
        <h1 className="mt-3 text-3xl leading-tight font-bold text-(--farabak-ink-deep) sm:text-4xl">
          ابعاد دستگاه و مسیر نصب ایکس‌ری را بررسی کنید
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-(--farabak-ink-muted)">
          ابعاد اقلام و محل را ثبت کنید تا یک خلاصهٔ قابل‌چاپ برای بررسی با کارشناس داشته باشید.
          برای اعلام نتیجهٔ تطبیق، ابعاد مستند دهانه و بدنهٔ مدل نیز لازم است.
        </p>
        <p className="mt-4 border-r-4 border-(--farabak-action-blue) bg-slate-50 px-4 py-3 text-sm leading-7 text-(--farabak-ink-deep)">
          این پیش‌بررسی اولیه است؛ نتیجه جایگزین بازدید محل، بررسی استانداردهای مربوط و ارزیابی گردش
          کار اپراتور نیست.
        </p>
      </header>
      <XraySiteFitTool />
    </PublicShell>
  );
}
