import {
  ArrowLeft,
  BookOpenText,
  Download,
  ExternalLink,
  FileArchive,
  MonitorDown,
  Smartphone,
} from "lucide-react";
import { Metadata } from "next";

import { ActionLink } from "@/components/public/ActionLink";
import { PublicShell } from "@/components/public/PublicShell";

export const metadata: Metadata = {
  title: "مرکز دانلود اپلیکیشن و منابع رسمی | فرابک",
  description:
    "دانلود رایگان نرم‌افزار، راهنماها و بروزرسانی‌های محصولات ریولینک، بلک مجیک و دستگاه‌های ایکس‌ری از فرابک. دسترسی آسان برای کاربران خرید دوربین مداربسته و سیستم‌های امنیتی.",
  robots: {
    index: true,
    follow: true,
  },
};

const downloadGroups = [
  {
    id: "reolink",
    eyebrow: "نظارت تصویری",
    title: "اپ‌ها و کلاینت‌های رئولینک",
    description:
      "برای مشاهده زنده، بازپخش، تنظیمات و مدیریت دوربین‌ها، نسخه مناسب دستگاه خود را از منبع رسمی بگیرید.",
    sourceHref: "https://reolink.com/us/software-and-manual/",
    sourceLabel: "صفحه رسمی رئولینک",
    items: [
      {
        title: "اپلیکیشن موبایل",
        platform: "Android و iOS",
        icon: Smartphone,
        label: "دریافت اپ موبایل",
      },
      {
        title: "کلاینت دسکتاپ",
        platform: "Windows و macOS",
        icon: MonitorDown,
        label: "دریافت کلاینت دسکتاپ",
      },
    ],
  },
  {
    id: "blackmagic",
    eyebrow: "تولید ویدئو",
    title: "نرم‌افزارهای Blackmagic Design",
    description:
      "نسخه‌های رسمی DaVinci Resolve و ابزارهای پشتیبانی Blackmagic را از صفحه اصلی سازنده دریافت کنید.",
    sourceHref: "https://www.blackmagicdesign.com/event/davinciresolvedownload",
    sourceLabel: "صفحه رسمی دانلود Blackmagic",
    items: [
      {
        title: "DaVinci Resolve",
        platform: "Windows، macOS، Linux و iPad",
        icon: MonitorDown,
        label: "دریافت DaVinci Resolve",
      },
      {
        title: "مرکز پشتیبانی",
        platform: "راهنما، آپدیت و یادداشت انتشار",
        icon: BookOpenText,
        href: "https://www.blackmagicdesign.com/support",
        label: "مشاهده پشتیبانی",
      },
    ],
  },
  {
    id: "farabak",
    eyebrow: "خدمات فرابک",
    title: "ابزارهای آنلاین مشتریان",
    description:
      "برای پیگیری خدمات و پیدا کردن راهنمای مناسب، از مسیرهای داخلی فرابک استفاده کنید.",
    items: [
      {
        title: "پیگیری گارانتی",
        platform: "ثبت و بررسی وضعیت گارانتی",
        icon: FileArchive,
        href: "/support/warranty-tracking",
        label: "پیگیری گارانتی",
      },
      {
        title: "راهنما و سوالات متداول",
        platform: "مقالات آموزشی و پاسخ‌های سریع",
        icon: BookOpenText,
        href: "/support/faq",
        label: "مشاهده راهنماها",
      },
    ],
  },
];

const DownloadCenterPage = () => {
  return (
    <PublicShell className="pb-16">
      <header className="flex flex-col gap-5 py-10 md:gap-6 md:py-16">
        <p className="text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
          نرم‌افزار و راهنما
        </p>
        <div className="max-w-4xl">
          <h1 className="text-3xl leading-tight font-bold tracking-tight text-(--farabak-ink-deep) md:text-5xl">
            یک مرکز برای همه ابزارهای موردنیاز شما
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-(--farabak-ink-muted) md:text-lg">
            اپلیکیشن‌ها، کلاینت‌های دسکتاپ، ابزارهای تولید محتوا و مسیرهای خدمات آنلاین را بر اساس
            برند و کاربرد پیدا کنید.
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {downloadGroups.map((group) => (
          <section
            key={group.id}
            aria-labelledby={`${group.id}-downloads`}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-end md:justify-between md:p-8">
              <div>
                <p className="text-sm font-semibold text-(--farabak-action-blue)">
                  {group.eyebrow}
                </p>
                <h2
                  id={`${group.id}-downloads`}
                  className="mt-2 text-2xl font-bold text-(--farabak-ink-deep)"
                >
                  {group.title}
                </h2>
                <p className="mt-2 max-w-3xl leading-8 text-(--farabak-ink-muted)">
                  {group.description}
                </p>
              </div>
              {group.sourceHref ? (
                <ActionLink
                  href={group.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  variant="quiet"
                  className="self-start px-0 md:self-auto"
                >
                  {group.sourceLabel} <ExternalLink aria-hidden="true" className="size-4" />
                </ActionLink>
              ) : null}
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
              {group.items.map((download) => {
                const Icon = download.icon;
                const href = "href" in download ? download.href : group.sourceHref;
                if (!href) return null;
                return (
                  <article
                    key={download.title}
                    className="flex min-h-36 flex-col justify-between rounded-xl border border-slate-200 bg-(--farabak-paper) p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-(--farabak-action-blue)/40 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-(--farabak-action-blue) shadow-sm">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div>
                        <h3 className="font-bold text-(--farabak-ink-deep)">{download.title}</h3>
                        <p className="mt-1 text-sm leading-7 text-(--farabak-ink-muted)">
                          {download.platform}
                        </p>
                      </div>
                    </div>
                    <ActionLink
                      href={href}
                      target={href?.startsWith("http") ? "_blank" : undefined}
                      rel={href?.startsWith("http") ? "noreferrer" : undefined}
                      className="mt-5 w-full sm:w-auto"
                    >
                      <Download aria-hidden="true" className="size-4" />
                      {download.label} <ArrowLeft aria-hidden="true" className="size-4" />
                    </ActionLink>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </PublicShell>
  );
};

export default DownloadCenterPage;
