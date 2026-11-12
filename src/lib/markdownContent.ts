const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://farabak.net";

export interface MarkdownPage {
  path: string;
  title: string;
  markdown: string;
}

const homeMarkdown = `# فرابک | فروشگاه تخصصی محصولات نظارتی و امنیتی

فرابک واردکننده اصلی محصولات **ریولینک (Reolink)**، **Smiths Detection** و **Ceia** در ایران است و انواع محصولات نظارتی و امنیتی شامل دوربین مداربسته، سیستم‌های تشخیص و بازرسی را با گارانتی معتبر، تضمین اصالت کالا و خدمات پس از فروش حرفه‌ای عرضه می‌کند.

## بخش‌های اصلی سایت

- [فروشگاه محصولات](/products): دسته‌بندی کامل دوربین‌های مداربسته و تجهیزات امنیتی
- [درباره ما](/about-us): معرفی فعالیت‌ها، اعضا و پروژه‌های فرابک
- [تماس با ما](/contact-us): اطلاعات تماس، آدرس و فرم ارتباط
- [حریم خصوصی](/privacy): سیاست حفظ حریم خصوصی کاربران
- [مرکز پشتیبانی](/support): سوالات متداول، وبلاگ و پیگیری گارانتی

## چرا فرابک

- واردکننده رسمی محصولات ریولینک، Smiths Detection و Ceia در ایران
- گارانتی معتبر و تضمین اصالت کالا
- خدمات پس از فروش حرفه‌ای
- مشاوره تخصصی برای انتخاب سیستم نظارت تصویری مناسب منزل، محل کار و پروژه‌های صنعتی

برای مشاهده فهرست کامل صفحات، [نقشه سایت](/sitemap.xml) را ببینید.
`;

const productsMarkdown = `# محصولات نظارتی و امنیتی فرابک

فروشگاه فرابک دسته‌بندی کاملی از دوربین‌های مداربسته ریولینک و تجهیزات امنیتی را ارائه می‌دهد:

- دوربین‌های مداربسته داخلی (Indoor)
- دوربین‌های مداربسته خارجی (Outdoor)
- دوربین‌های تحت شبکه (IP)
- تجهیزات تشخیص و بازرسی Smiths Detection و Ceia
- لوازم جانبی نظارت تصویری

همه محصولات با گارانتی معتبر و تضمین اصالت کالا عرضه می‌شوند.

فهرست کامل دسته‌بندی‌ها و محصولات: ${SITE_URL}/products
`;

const supportMarkdown = `# مرکز پشتیبانی فرابک

در مرکز پشتیبانی فرابک می‌توانید به این منابع دسترسی داشته باشید:

- [سوالات متداول](/support/faq): پاسخ پرتکرارترین پرسش‌های خرید و گارانتی
- [پیگیری گارانتی](/support/warranty-tracking): استعلام وضعیت گارانتی محصولات
- [دانلود سنتر](/support/download-center): کاتالوگ، راهنما و نرم‌افزارها
- [وبلاگ](/support/blog): مقالات آموزشی درباره نظارت تصویری و امنیت

برای پشتیبانی مستقیم به صفحه [تماس با ما](/contact-us) مراجعه کنید.
`;

const aboutMarkdown = `# درباره فرابک

فرابک واردکننده اصلی محصولات ریولینک (Reolink)، Smiths Detection و Ceia در ایران است و سال‌هاست در حوزه تأمین محصولات نظارتی و امنیتی فعالیت می‌کند.

صفحات مرتبط:

- [فعالیت‌ها](/about-us/activity)
- [اعضای تیم](/about-us/members)
- [پروژه‌ها](/about-us/projects)

اطلاعات تماس در صفحه [تماس با ما](/contact-us) موجود است.
`;

const contactMarkdown = `# تماس با فرابک

برای ارتباط با فرابک می‌توانید از راه‌های زیر استفاده کنید:

- تلفن پشتیبانی: ${process.env.NEXT_PUBLIC_SUPPORT_NUMBER || "-"}
- فرم ارتباط آنلاین: [تماس با ما](${SITE_URL}/contact-us)
- آدرس: تهران، ایران

کارشناسان ما برای مشاوره خرید دوربین مداربسته و تجهیزات امنیتی، پیگیری گارانتی و خدمات پس از فروش آماده پاسخگویی هستند.
`;

const privacyMarkdown = `# حریم خصوصی

سیاست حفظ حریم خصوصی فرابک در صفحه [حریم خصوصی](${SITE_URL}/privacy) منتشر شده است و توضیح می‌دهد چه داده‌هایی جمع‌آوری می‌شود، چگونه استفاده و محافظت می‌شود و چه حقوقی برای کاربران قائل هستیم.
`;

export const markdownPages: Record<string, MarkdownPage> = {
  "": {
    path: "/",
    title: "فرابک | فروشگاه تخصصی محصولات نظارتی و امنیتی",
    markdown: homeMarkdown,
  },
  products: { path: "/products", title: "محصولات", markdown: productsMarkdown },
  support: { path: "/support", title: "پشتیبانی", markdown: supportMarkdown },
  "about-us": { path: "/about-us", title: "درباره ما", markdown: aboutMarkdown },
  "contact-us": { path: "/contact-us", title: "تماس با ما", markdown: contactMarkdown },
  privacy: { path: "/privacy", title: "حریم خصوصی", markdown: privacyMarkdown },
};

/** Normalize a request pathname ("/", "/about-us/", "/about-us") to a lookup key. */
export function markdownKeyFromPath(pathname: string): string {
  return pathname.replace(/^\/+|\/+$/g, "");
}

/**
 * Build a helpful 404 body in markdown so agents can recover,
 * pointing at the sitemap, llms.txt and key pages.
 */
export function buildNotFoundMarkdown(pathname: string): string {
  return `# صفحه یافت نشد (404)

آدرس \`${pathname}\` در سایت فرابک وجود ندارد.

## مسیرهای پیشنهادی

- [صفحه اصلی](/)
- [فروشگاه محصولات](/products)
- [مرکز پشتیبانی](/support)
- [درباره ما](/about-us)
- [تماس با ما](/contact-us)
- [حریم خصوصی](/privacy)
- [نقشه سایت (XML)](/sitemap.xml)
- [راهنمای عامل‌های هوشمند (llms.txt)](/llms.txt)
`;
}
