import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";

import XraySiteFitTool from "./XraySiteFitTool";

export const metadata: Metadata = {
  title: "پیش‌بررسی ابعاد و محل نصب ایکس‌ری | فرابک",
  description: "ابعاد اقلام، مسیر تحویل و فضای نصب دستگاه ایکس‌ری را برای گفت‌وگو با کارشناس ثبت کنید.",
  alternates: { canonical: "/support/tools/xray-fit" },
};

export default function XrayFitPage() {
  return (
    <PublicShell className="py-8 sm:py-12">
      <Link href="/support/tools" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-(--farabak-action-blue) underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">
        <ArrowRight aria-hidden="true" className="size-4" /> بازگشت به ابزارهای پشتیبانی
      </Link>
      <header className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold text-(--farabak-action-blue)">برنامه‌ریزی پیش از بازدید</p>
        <h1 className="mt-3 text-3xl leading-tight font-bold text-(--farabak-ink-deep) sm:text-4xl">ابعاد دستگاه و مسیر نصب ایکس‌ری را بررسی کنید</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-(--farabak-ink-muted)">ابعاد اقلام و محل را ثبت کنید تا یک خلاصهٔ قابل‌چاپ برای بررسی با کارشناس داشته باشید. برای اعلام نتیجهٔ تطبیق، ابعاد مستند دهانه و بدنهٔ مدل نیز لازم است.</p>
        <p className="mt-4 border-r-4 border-(--farabak-action-blue) bg-slate-50 px-4 py-3 text-sm leading-7 text-(--farabak-ink-deep)">این پیش‌بررسی اولیه است؛ نتیجه جایگزین بازدید محل، بررسی استانداردهای مربوط و ارزیابی گردش کار اپراتور نیست.</p>
      </header>
      <XraySiteFitTool />
    </PublicShell>
  );
}
