import type { Metadata } from "next";

import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";
import { PublicShell } from "@/components/public/PublicShell";

import CctvStorageTool from "./CctvStorageTool";

export const metadata: Metadata = {
  alternates: { canonical: "/support/tools/cctv-storage" },
  title: "برآورد فضای ذخیره‌سازی دوربین مداربسته | فرابک",
  description:
    "حجم ذخیره‌سازی، پهنای باند و فضای پیشنهادی دوربین‌های مداربسته را بر اساس نرخ بیت، زمان ضبط و مدت نگهداری برآورد کنید.",
};

export default function CctvStoragePage() {
  return (
    <PublicShell className="pt-6 pb-12 sm:pt-8 sm:pb-14 print:max-w-none print:px-0">
      <PublicBreadcrumbs
        breadcrumbs={["/", "/support", "/support/tools", "/support/tools/cctv-storage"]}
        labels={{
          "/support/tools": "ابزارهای پشتیبانی",
          "/support/tools/cctv-storage": "برآورد ذخیره‌سازی دوربین",
        }}
      />
      <header className="mb-8 border-b border-slate-200 pb-7 sm:mb-10">
        <p className="text-sm font-semibold text-(--farabak-action-blue)">
          برنامه‌ریزی سامانه نظارت تصویری
        </p>
        <h1 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-(--farabak-ink-deep) sm:text-4xl">
          برآورد فضای ذخیره‌سازی دوربین مداربسته
        </h1>
        <p className="mt-4 max-w-3xl leading-8 text-(--farabak-ink-muted)">
          نرخ بیت و برنامه ضبط هر گروه را وارد کنید تا حجم روزانه، فضای نگهداری و پهنای باند تقریبی
          را ببینید. مقدار واقعی با حرکت صحنه، تنظیمات فشرده‌سازی، صدا و رفتار دستگاه تغییر می‌کند و
          تضمین ظرفیت نیست.
        </p>
      </header>
      <CctvStorageTool />
    </PublicShell>
  );
}
