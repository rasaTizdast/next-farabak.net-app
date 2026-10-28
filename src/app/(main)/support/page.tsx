import { ArrowLeft, BookOpenText, CircleHelp, Download, ShieldCheck } from "lucide-react";
import { Metadata } from "next";

import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicShell } from "@/components/public/PublicShell";
import supportData from "@/constants/supportData.json";

export const metadata: Metadata = {
  title: "پشتیبانی مشتریان فرابک | گارانتی و سوالات متداول",
  description:
    "در بخش پشتیبانی فرابک، به دانلود نرم‌افزارها، پیگیری گارانتی، سوالات متداول و مقالات آموزشی دسترسی پیدا کنید. پشتیبانی حرفه‌ای برای محصولات امنیتی مانند ریولینک و بلک مجیک",
  robots: {
    index: true,
    follow: true,
  },
};

const supportIcons = {
  blog: BookOpenText,
  "warranty-tracking": ShieldCheck,
  "download-center": Download,
  faq: CircleHelp,
} as const;

const formatIndex = (value: number) =>
  new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(value);

const SupportPage = () => {
  return (
    <PublicShell className="pb-16">
      <PageIntro
        eyebrow="پشتیبانی مشتریان"
        title="هر چیزی که برای ادامه مسیر لازم دارید"
        description="از یک سوال سریع تا پیگیری گارانتی و دریافت نرم‌افزار، مسیر مناسب را انتخاب کنید و بدون گم‌شدن بین صفحات به پاسخ برسید."
        actions={
          <ActionLink href="/contact-us" variant="secondary">
            تماس با پشتیبانی
          </ActionLink>
        }
      />

      <section aria-labelledby="support-services-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-(--farabak-action-blue)">خدمات اصلی</p>
            <h2
              id="support-services-heading"
              className="mt-2 text-2xl font-bold text-(--farabak-ink-deep) md:text-3xl"
            >
              از اینجا شروع کنید
            </h2>
          </div>
          <span className="hidden text-sm text-(--farabak-ink-muted) md:block">
            ۴ مسیر روشن برای پشتیبانی
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {supportData.map((item) => {
            const Icon = supportIcons[item.link as keyof typeof supportIcons];

            return (
              <article
                key={item.id}
                className="group flex min-h-56 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-(--farabak-action-blue)/40 hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-12 place-items-center rounded-xl bg-(--farabak-surface-blue) text-(--farabak-action-blue)">
                      <Icon aria-hidden="true" className="size-6" />
                    </span>
                    <span className="text-sm font-semibold text-slate-400">
                      {formatIndex(item.id)}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-(--farabak-ink-deep)">{item.title}</h3>
                  <p className="mt-3 max-w-lg leading-8 text-(--farabak-ink-muted)">{item.desc}</p>
                </div>
                <ActionLink
                  href={`/support/${item.link}`}
                  variant="quiet"
                  className="mt-6 self-start px-0"
                >
                  مشاهده مسیر <ArrowLeft aria-hidden="true" className="size-4" />
                </ActionLink>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-4 rounded-2xl bg-(--farabak-ink-deep) p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <p className="text-sm font-semibold text-cyan-200">نیاز به راهنمایی انسانی دارید؟</p>
          <h2 className="mt-2 text-2xl font-bold">تیم فرابک آماده پاسخ‌گویی است</h2>
          <p className="mt-3 max-w-2xl leading-8 text-slate-300">
            اگر پاسخ موردنظرتان را پیدا نکردید، جزئیات درخواست را برای ما بفرستید تا سریع‌تر
            راهنمایی‌تان کنیم.
          </p>
        </div>
        <ActionLink
          href="/contact-us"
          className="bg-white text-(--farabak-ink-deep) hover:bg-slate-100"
        >
          ارتباط با فرابک <ArrowLeft aria-hidden="true" className="size-4" />
        </ActionLink>
      </section>
    </PublicShell>
  );
};

export default SupportPage;
