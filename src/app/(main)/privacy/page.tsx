export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Script from "next/script";

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
    heading: "داده‌هایی که جمع‌آوری می‌کنیم",
    body: "فرابک تنها اطلاعاتی را جمع‌آوری می‌کند که برای ارائه خدمات لازم است؛ از جمله نام، شماره تماس، آدرس ایمیل و آدرس پستی هنگام ثبت سفارش، ارسال پیام از طریق فرم تماس یا ثبت درخواست گارانتی. علاوه بر این، اطلاعات فنی محدودی مانند نوع مرورگر و صفحات بازدیدشده به صورت ناشناس برای بهبود عملکرد سایت ثبت می‌شود.",
  },
  {
    heading: "نحوه استفاده از اطلاعات",
    body: "از اطلاعاتی که در اختیار ما قرار می‌دهید فقط برای پردازش سفارش‌ها، ارسال کالا، پاسخ به پرسش‌ها، ارائه خدمات گارانتی و بهبود تجربه خرید استفاده می‌کنیم. اطلاعات شما در اختیار اشخاص ثالث برای اهداف تبلیغاتی قرار نمی‌گیرد و صرفاً در صورت نیاز قانونی یا برای همکاران ارسال و لجستیک لازم، به حداقل ممکن اشتراک‌گذاری می‌شود.",
  },
  {
    heading: "محافظت از اطلاعات",
    body: "از روش‌های استاندارد امنیتی از جمله ارتباط رمزنگاری‌شده (HTTPS)، کنترل دسترسی مبتنی بر نقش و ذخیره‌سازی امن رمزهای عبور برای محافظت از داده‌های شما استفاده می‌کنیم. دسترسی به اطلاعات شخصی کاربران تنها برای کارکنان مجاز و در حد ضرورت امکان‌پذیر است.",
  },
  {
    heading: "کوکی‌ها و تحلیل آماری",
    body: "سایت فرابک از کوکی‌ها برای نگهداری سبد خرید، وضعیت ورود کاربران و شخصی‌سازی تجربه استفاده می‌کند. همچنین از ابزارهای تحلیل آماری ناشناس مانند Google Analytics و Umami برای شناخت الگوی بازدید بهره می‌گیریم. شما می‌توانید کوکی‌ها را از طریق تنظیمات مرورگر خود مدیریت کنید.",
  },
  {
    heading: "حقوق کاربران و ارتباط با ما",
    body: "شما این حق را دارید که درباره داده‌های خود استعلام بگیرید، اصلاح آن‌ها را درخواست کنید یا حذف حساب کاربری خود را بخواهید. برای هر یک از این درخواست‌ها یا هر پرسش دیگری درباره حریم خصوصی، از طریق صفحه «تماس با ما» با پشتیبانی فرابک در ارتباط باشید. این سیاست ممکن است به‌روزرسانی شود و آخرین نسخه همیشه در همین صفحه منتشر خواهد شد.",
  },
];

const PrivacyPage = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Script
        id="privacy-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <h1 className="text-dark-blue mb-6 text-3xl font-bold">حریم خصوصی</h1>
      <div className="flex flex-col gap-8">
        {privacySections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-dark-blue mb-2 text-xl font-bold">{section.heading}</h2>
            <p className="leading-8 text-gray-700">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default PrivacyPage;
