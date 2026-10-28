import type { Metadata } from "next";

import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicShell } from "@/components/public/PublicShell";

export const metadata: Metadata = {
  title: "حریم خصوصی | فرابک",
  description:
    "سیاست حفظ حریم خصوصی فرابک: توضیح داده‌هایی که جمع‌آوری می‌کنیم، نحوه استفاده و محافظت از آن‌ها و حقوق کاربران.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/privacy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "حریم خصوصی | فرابک",
  url: `${process.env.NEXT_PUBLIC_BASE_URL}/privacy`,
  description:
    "سیاست حفظ حریم خصوصی فرابک شامل توضیح داده‌های جمع‌آوری‌شده، نحوه استفاده، محافظت و حقوق کاربران",
  isPartOf: {
    "@type": "WebSite",
    name: "فرابک",
    url: process.env.NEXT_PUBLIC_BASE_URL,
  },
  inLanguage: "fa-IR",
};

const privacySections = [
  {
    id: "data-collection",
    heading: "داده‌هایی که جمع‌آوری می‌کنیم",
    body: "فرابک تنها اطلاعاتی را جمع‌آوری می‌کند که برای ارائه خدمات لازم است؛ از جمله نام، شماره تماس، آدرس ایمیل و آدرس پستی هنگام ثبت سفارش، ارسال پیام از طریق فرم تماس یا ثبت درخواست گارانتی. علاوه بر این، اطلاعات فنی محدودی مانند نوع مرورگر و صفحات بازدیدشده به صورت ناشناس برای بهبود عملکرد سایت ثبت می‌شود.",
  },
  {
    id: "data-use",
    heading: "نحوه استفاده از اطلاعات",
    body: "از اطلاعاتی که در اختیار ما قرار می‌دهید فقط برای پردازش سفارش‌ها، ارسال کالا، پاسخ به پرسش‌ها، ارائه خدمات گارانتی و بهبود تجربه خرید استفاده می‌کنیم. اطلاعات شما در اختیار اشخاص ثالث برای اهداف تبلیغاتی قرار نمی‌گیرد و صرفاً در صورت نیاز قانونی یا برای همکاران ارسال و لجستیک لازم، به حداقل ممکن اشتراک‌گذاری می‌شود.",
  },
  {
    id: "data-security",
    heading: "محافظت از اطلاعات",
    body: "از روش‌های استاندارد امنیتی از جمله ارتباط رمزنگاری‌شده (HTTPS)، کنترل دسترسی مبتنی بر نقش و ذخیره‌سازی امن رمزهای عبور برای محافظت از داده‌های شما استفاده می‌کنیم. دسترسی به اطلاعات شخصی کاربران تنها برای کارکنان مجاز و در حد ضرورت امکان‌پذیر است.",
  },
  {
    id: "cookies-analytics",
    heading: "کوکی‌ها و تحلیل آماری",
    body: "سایت فرابک از کوکی‌ها برای نگهداری سبد خرید، وضعیت ورود کاربران و شخصی‌سازی تجربه استفاده می‌کند. همچنین از ابزارهای تحلیل آماری ناشناس مانند Google Analytics و Umami برای شناخت الگوی بازدید بهره می‌گیریم. شما می‌توانید کوکی‌ها را از طریق تنظیمات مرورگر خود مدیریت کنید.",
  },
  {
    id: "user-rights",
    heading: "حقوق کاربران و ارتباط با ما",
    body: "شما این حق را دارید که درباره داده‌های خود استعلام بگیرید، اصلاح آن‌ها را درخواست کنید یا حذف حساب کاربری خود را بخواهید. برای هر یک از این درخواست‌ها یا هر پرسش دیگری درباره حریم خصوصی، از طریق صفحه «تماس با ما» با پشتیبانی فرابک در ارتباط باشید. این سیاست ممکن است به‌روزرسانی شود و آخرین نسخه همیشه در همین صفحه منتشر خواهد شد.",
  },
];

const PrivacyPage = () => {
  return (
    <>
      <script
        id="privacy-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PublicShell as="main" className="py-10 sm:py-14 lg:py-16">
        <PageIntro
          eyebrow="سیاست سایت"
          title="حریم خصوصی، با زبان روشن"
          description="در این صفحه توضیح می‌دهیم چه داده‌هایی برای ارائه خدمات لازم است، چگونه از آن‌ها استفاده می‌کنیم و چطور می‌توانید درباره داده‌های خود با ما در ارتباط باشید."
          actions={
            <ActionLink href="/contact-us" variant="secondary">
              ارتباط درباره داده‌های شما
            </ActionLink>
          }
        />

        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <nav
            aria-label="فهرست سیاست حریم خصوصی"
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(6,26,48,0.06)] lg:sticky lg:top-28"
          >
            <p className="mb-4 text-sm font-bold text-(--farabak-ink-deep)">در این صفحه</p>
            <ol className="space-y-1">
              {privacySections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-label={section.heading}
                    className="flex gap-3 rounded-xl px-3 py-2 text-sm leading-7 text-(--farabak-ink-muted) transition-colors hover:bg-slate-50 hover:text-(--farabak-action-blue) focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none"
                  >
                    <span className="shrink-0 font-semibold text-(--farabak-action-blue)">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{section.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-10 lg:p-12">
            <div className="space-y-12">
              {privacySections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2 className="text-2xl leading-10 font-bold text-(--farabak-ink-deep)">
                    {section.heading}
                  </h2>
                  <p className="mt-4 text-justify text-base leading-[2.2] text-(--farabak-ink-muted)">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          </article>
        </div>
      </PublicShell>
    </>
  );
};

export default PrivacyPage;
