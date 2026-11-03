import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";
import { PublicShell } from "@/components/public/PublicShell";

export const metadata: Metadata = {
  alternates: { canonical: "/support/tools" },
  title: "ابزارهای انتخاب و برآورد تجهیزات | فرابک",
  description:
    "پیش از انتخاب تجهیزات، نیاز پروژه‌تان را برآورد کنید یا یک شرح پروژه روشن برای گفت‌وگو با کارشناسان فرابک آماده کنید.",
};

const tools = [
  {
    category: "سامانه نظارت تصویری",
    title: "برآورد فضای ذخیره‌سازی دوربین‌ها",
    description:
      "حجم تصویر، تعداد دوربین و مدت نگهداری را کنار هم بگذارید تا نیاز ذخیره‌سازی روشن شود.",
    href: "/support/tools/cctv-storage",
  },
  {
    category: "بازرسی و کنترل تردد",
    title: "بررسی اولیه تناسب دستگاه ایکس‌ری",
    description: "ابعاد اشیا و شیوه عبور را مشخص کنید تا محدوده مناسب دستگاه‌های بازرسی را بسنجید.",
    href: "/support/tools/xray-fit",
  },
  {
    category: "تولید و ضبط تصویر",
    title: "برآورد زمان ضبط Blackmagic",
    description: "قالب ضبط و رسانه را وارد کنید تا برآوردی از زمان ضبط در دسترس داشته باشید.",
    href: "/support/tools/blackmagic-record-time",
  },
  {
    category: "جلسه و ارائه",
    title: "برنامه‌ریزی نمایشگر اتاق جلسه",
    description:
      "اندازه اتاق و فاصله دید را بررسی کنید تا برای انتخاب نمایشگر اطلاعات اولیه داشته باشید.",
    href: "/support/tools/meeting-room",
  },
  {
    category: "شرح نیاز پروژه",
    title: "ساخت شرح پروژه",
    description:
      "پرسش‌های مرتبط با نوع پروژه را پاسخ دهید و یک برگه قابل چاپ برای گفت‌وگوی دقیق‌تر بسازید.",
    href: "/support/tools/project-brief",
  },
] as const;

export default function ToolsPage() {
  return (
    <PublicShell className="pt-6 pb-12 sm:pt-8 sm:pb-16">
      <PublicBreadcrumbs
        breadcrumbs={["/", "/support", "/support/tools"]}
        labels={{ "/support/tools": "ابزارهای آنلاین" }}
      />
      <header className="grid gap-6 border-b border-slate-200 py-7 sm:py-10 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold text-(--farabak-action-blue)">
            پیش از انتخاب تجهیزات
          </p>
          <h1 className="mt-3 text-3xl leading-[1.4] font-bold tracking-tight text-(--farabak-ink-deep) sm:text-4xl md:text-5xl">
            نیاز پروژه را روشن‌تر ببینید
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-(--farabak-ink-muted) sm:text-lg">
            برای برآورد اولیه یا آماده‌کردن پرسش‌های پروژه، ابزاری را بر اساس کاری که می‌خواهید
            انجام دهید انتخاب کنید. نتیجه‌ها نقطه شروع بررسی‌اند و جایگزین طراحی تخصصی نیستند.
          </p>
        </div>
        <Link
          href="/support"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-(--farabak-ink-deep) underline-offset-4 hover:text-(--farabak-action-blue) hover:underline focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue)"
        >
          بازگشت به پشتیبانی <ArrowLeft aria-hidden="true" className="size-4" />
        </Link>
      </header>

      <nav aria-label="ابزارهای آنلاین" className="mt-2">
        <ol className="divide-y divide-slate-200">
          {tools.map((tool, index) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="group grid gap-3 py-6 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--farabak-action-blue) motion-reduce:transition-none sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:py-7"
              >
                <span aria-hidden="true" className="font-mono text-sm text-slate-400" dir="ltr">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="text-xs font-semibold text-(--farabak-action-blue)">
                    {tool.category}
                  </span>
                  <span className="mt-1 block text-xl font-bold text-(--farabak-ink-deep) group-hover:text-(--farabak-action-blue) sm:text-2xl">
                    {tool.title}
                  </span>
                  <span className="mt-2 block max-w-3xl text-sm leading-7 text-(--farabak-ink-muted) sm:text-base">
                    {tool.description}
                  </span>
                </span>
                <ArrowLeft
                  aria-hidden="true"
                  className="hidden size-5 text-(--farabak-action-blue) transition-transform group-hover:-translate-x-1 motion-reduce:transition-none sm:block"
                />
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </PublicShell>
  );
}
