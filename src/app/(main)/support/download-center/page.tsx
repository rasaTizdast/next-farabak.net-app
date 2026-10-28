import { Download, ExternalLink, FileArchive, Smartphone } from "lucide-react";
import { Metadata } from "next";

import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicShell } from "@/components/public/PublicShell";

export const metadata: Metadata = {
  title: "مرکز دانلود نرم‌افزار و آپدیت | فرابک",
  description:
    "دانلود رایگان نرم‌افزار، راهنماها و بروزرسانی‌های محصولات ریولینک، بلک مجیک و دستگاه‌های ایکس‌ری از فرابک. دسترسی آسان برای کاربران خرید دوربین مداربسته و سیستم‌های امنیتی.",
  robots: {
    index: true,
    follow: true,
  },
};

const downloads = [
  {
    fileName: "Reolink App",
    type: "Android app",
    size: "از فروشگاه",
    href: "https://play.google.com/store/apps/details?id=com.mcu.reolink",
    label: "دریافت اپلیکیشن اندروید رئولینک",
  },
  {
    fileName: "Reolink App",
    type: "iOS app",
    size: "از فروشگاه",
    href: "https://itunes.apple.com/us/app/reolink/id995927563?ls=1&mt=8",
    label: "دریافت اپلیکیشن iOS رئولینک",
  },
  {
    fileName: "reolink_setup_8168_0.exe",
    type: "Windows installer",
    size: "حجم در منبع رسمی",
    href: "https://home-cdn.reolink.us/wp-content/uploads/2024/07/241029151721816955.6833.exe?download_name=reolink_setup_8168_0.exe",
    label: "دریافت اپلیکیشن Windows رئولینک",
  },
  {
    fileName: "Reolink_Client_885.dmg",
    type: "macOS installer",
    size: "حجم در منبع رسمی",
    href: "https://home-cdn.reolink.us/wp-content/uploads/2023/03/170224401679019880.5577.dmg?download_name=Reolink_Client_885.dmg",
    label: "دریافت اپلیکیشن Mac رئولینک",
  },
];

const DownloadCenterPage = () => {
  return (
    <PublicShell className="pb-16">
      <PageIntro
        eyebrow="نرم‌افزار و راهنما"
        title="مرکز دانلود رئولینک"
        description="نسخه مناسب سیستم‌عامل خود را انتخاب کنید. لینک‌های نصب مستقیم به منابع رسمی رئولینک متصل هستند و نسخه‌های فروشگاهی از صفحه رسمی برنامه باز می‌شوند."
        actions={
          <ActionLink
            href="https://reolink.com/software-and-manual/"
            target="_blank"
            rel="noreferrer"
            variant="secondary"
          >
            همه منابع رسمی <ExternalLink aria-hidden="true" className="size-4" />
          </ActionLink>
        }
      />

      <section
        aria-labelledby="download-list-heading"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
      >
        <div className="flex flex-col gap-2 border-b border-slate-100 p-5 md:p-8">
          <p className="text-sm font-semibold text-(--farabak-action-blue)">فایل‌های موجود</p>
          <h2 id="download-list-heading" className="text-2xl font-bold text-(--farabak-ink-deep)">
            انتخاب سریع برای دستگاه شما
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {downloads.map((download) => (
            <div
              key={download.fileName + download.type}
              className="flex flex-col gap-4 p-5 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8 md:p-6"
            >
              <div className="flex min-w-0 items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-(--farabak-surface-blue) text-(--farabak-action-blue)">
                  {download.type.includes("app") ? (
                    <Smartphone aria-hidden="true" className="size-5" />
                  ) : (
                    <FileArchive aria-hidden="true" className="size-5" />
                  )}
                </span>
                <div className="min-w-0">
                  <h3
                    className="truncate font-bold text-(--farabak-ink-deep)"
                    dir="ltr"
                    title={download.fileName}
                  >
                    {download.fileName}
                  </h3>
                  <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-(--farabak-ink-muted)">
                    <div className="flex gap-1">
                      <dt>نوع:</dt>
                      <dd dir="ltr">{download.type}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt>حجم:</dt>
                      <dd>{download.size}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <ActionLink
                href={download.href}
                target="_blank"
                rel="noreferrer"
                className="w-full md:w-auto"
              >
                <Download aria-hidden="true" className="size-4" />
                {download.label}
              </ActionLink>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
};

export default DownloadCenterPage;
