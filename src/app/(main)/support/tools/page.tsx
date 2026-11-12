import { ArrowLeft, ArrowUpLeft, Camera, CircleDot, Presentation, ScanLine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";
import { PublicShell } from "@/components/public/PublicShell";

export const metadata: Metadata = {
  alternates: { canonical: "/support/tools" },
  title: "ابزارهای برآورد تجهیزات و فضای نصب | فرابک",
  description:
    "ابزارهای تعاملی فرابک برای برآورد ظرفیت ذخیره‌سازی دوربین، بررسی اولیه تناسب دستگاه ایکس‌ری و برنامه‌ریزی تصویر اتاق جلسه.",
};

const tools = [
  {
    number: "01",
    eyebrow: "سامانه نظارت تصویری",
    title: "فضای ذخیره‌سازی دوربین",
    description:
      "تعداد دوربین، کیفیت تصویر و مدت نگهداری را وارد کنید؛ ظرفیت موردنیاز را زنده ببینید.",
    outcome: "ظرفیت و تفکیک گروه‌ها",
    href: "/support/tools/cctv-storage",
    icon: Camera,
    accent: "border-t-cyan-500",
    iconTone: "bg-cyan-50 text-cyan-800",
  },
  {
    number: "02",
    eyebrow: "بازرسی و کنترل تردد",
    title: "تناسب اولیه دستگاه ایکس‌ری",
    description:
      "ابعاد قلم، مسیر عبور و فضای نصب را مرحله‌به‌مرحله ثبت کنید و موارد نیازمند بررسی را ببینید.",
    outcome: "مقایسهٔ ابعاد منتشرشده",
    href: "/support/tools/xray-fit",
    icon: ScanLine,
    accent: "border-t-amber-500",
    iconTone: "bg-amber-50 text-amber-800",
  },
  {
    number: "03",
    eyebrow: "جلسه و ارائه",
    title: "برنامه‌ریزی نمایش اتاق",
    description:
      "ابعاد اتاق و جای نشستن را تغییر دهید؛ شماتیک تصویر و فاصلهٔ نصب را همان لحظه بررسی کنید.",
    outcome: "پیش‌نمایش زندهٔ پروژکتور",
    href: "/support/tools/meeting-room",
    icon: Presentation,
    accent: "border-t-violet-500",
    iconTone: "bg-violet-50 text-violet-800",
  },
] as const;

export default function ToolsPage() {
  return (
    <PublicShell className="pt-6 pb-14 sm:pt-8 sm:pb-20">
      <PublicBreadcrumbs
        breadcrumbs={["/", "/support", "/support/tools"]}
        labels={{ "/support/tools": "ابزارهای آنلاین" }}
      />

      <section className="relative mt-6 overflow-hidden rounded-2xl bg-[#071d35] text-white sm:mt-8">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-12 size-80 rounded-full border border-white/10" />
          <div className="absolute -top-22 -left-2 size-60 rounded-full border border-white/10" />
          <div className="absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-cyan-300/50 to-transparent" />
          <CircleDot
            className="absolute top-1/2 left-[12%] size-24 -translate-y-1/2 text-cyan-200/15"
            strokeWidth={1}
          />
        </div>
        <div className="relative grid gap-9 px-6 py-9 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-14">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
              <span className="size-1.5 rounded-full bg-cyan-300" />
              ابزارهای تصمیم‌گیری فرابک
            </p>
            <h1 className="mt-4 text-3xl leading-[1.45] font-bold tracking-tight sm:text-4xl lg:text-5xl">
              قبل از انتخاب، تصویر روشن‌تری بسازید.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
              اطلاعات پروژه را وارد کنید و برآورد را همان لحظه ببینید. هر ابزار یک کار مشخص را ساده
              می‌کند و خروجی‌اش برای شروع گفت‌وگو با کارشناس آماده است.
            </p>
          </div>
          <Link
            href="/support"
            className="inline-flex min-h-12 w-fit items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
          >
            بازگشت به پشتیبانی <ArrowLeft aria-hidden="true" className="size-4" />
          </Link>
          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5 text-xs font-medium text-slate-300 lg:col-span-2">
            <span className="rounded-full bg-white/8 px-3 py-2">برآورد زنده</span>
            <span className="rounded-full bg-white/8 px-3 py-2">ورودی‌های قابل ویرایش</span>
            <span className="rounded-full bg-white/8 px-3 py-2">گزارش PDF برای هر ابزار</span>
          </div>
        </div>
      </section>

      <section className="mt-10 sm:mt-14" aria-labelledby="tools-list-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-7">
          <div>
            <p className="text-xs font-bold tracking-wide text-(--farabak-action-blue)">
              انتخاب ابزار
            </p>
            <h2
              id="tools-list-heading"
              className="mt-2 text-2xl font-bold text-(--farabak-ink-deep) sm:text-3xl"
            >
              از کجا شروع کنیم؟
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-(--farabak-ink-muted)">
            کاری را که می‌خواهید انجام دهید انتخاب کنید؛ برای شروع، همهٔ ابزارها به اطلاعات اولیه
            نیاز دارند.
          </p>
        </div>

        <nav aria-label="ابزارهای آنلاین" className="grid gap-4 md:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group flex min-h-80 flex-col rounded-xl border border-t-4 border-slate-200 ${tool.accent} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none motion-reduce:transform-none motion-reduce:transition-none sm:p-6`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`grid size-12 place-items-center rounded-xl ${tool.iconTone}`}>
                    <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                  </span>
                  <span dir="ltr" className="font-mono text-sm font-semibold text-slate-400">
                    {tool.number}
                  </span>
                </div>
                <span className="mt-6 text-xs font-bold text-(--farabak-action-blue)">
                  {tool.eyebrow}
                </span>
                <span className="mt-2 text-xl leading-8 font-bold text-(--farabak-ink-deep) group-hover:text-(--farabak-action-blue)">
                  {tool.title}
                </span>
                <span className="mt-2 text-sm leading-7 text-(--farabak-ink-muted)">
                  {tool.description}
                </span>
                <span className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-600">
                  <span>{tool.outcome}</span>
                  <ArrowUpLeft
                    aria-hidden="true"
                    className="size-4 text-(--farabak-action-blue) transition-transform group-hover:-translate-1 motion-reduce:transition-none"
                  />
                </span>
              </Link>
            );
          })}
        </nav>
      </section>

      <p className="mt-7 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-600">
        نتیجه‌ها برآورد اولیه بر پایهٔ اطلاعات واردشده‌اند؛ پیش از انتخاب نهایی، مشخصات پروژه و
        شرایط محل را با کارشناس بررسی کنید.
      </p>
    </PublicShell>
  );
}
