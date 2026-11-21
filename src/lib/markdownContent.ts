import { SITE_URL } from "@/constants/meta";
import type {
  ProductDetailPageCheck,
  ProductListingPageCheck,
} from "@/lib/data/product-page-validation";
import { parsePositivePageNumber } from "@/lib/pagination";

export interface MarkdownPage {
  path: string;
  title: string;
  markdown: string;
}

const homeMarkdown = `# فرابک | فروشگاه تخصصی محصولات نظارتی و امنیتی

فرابک در زمینه تجهیزات نظارت تصویری، کنترل تردد و بازرسی امنیتی فعالیت می‌کند. فهرست محصولات شامل دوربین مداربسته، دستگاه‌های ایکس‌ری و تجهیزات تشخیص فلز است.

## بخش‌های اصلی سایت

- [فروشگاه محصولات](/products): دسته‌بندی کامل دوربین‌های مداربسته و تجهیزات امنیتی
- [درباره ما](/about-us): معرفی فعالیت‌ها، اعضا و پروژه‌های فرابک
- [تماس با ما](/contact-us): اطلاعات تماس، آدرس و فرم ارتباط
- [حریم خصوصی](/privacy): سیاست حفظ حریم خصوصی کاربران
- [مرکز پشتیبانی](/support): سوالات متداول، وبلاگ و پیگیری گارانتی

برای مشاهده فهرست کامل صفحات، [نقشه سایت](/sitemap.xml) را ببینید.
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

شرکت فرابک از سال ۱۳۸۱ ثبت شده است و در زمینه تجهیزات نظارت تصویری، کنترل تردد و بازرسی امنیتی فعالیت می‌کند.

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
  support: { path: "/support", title: "پشتیبانی", markdown: supportMarkdown },
  "about-us": { path: "/about-us", title: "درباره ما", markdown: aboutMarkdown },
  "contact-us": { path: "/contact-us", title: "تماس با ما", markdown: contactMarkdown },
  privacy: { path: "/privacy", title: "حریم خصوصی", markdown: privacyMarkdown },
};

/** Normalize a request pathname ("/", "/about-us/", "/about-us") to a lookup key. */
export function markdownKeyFromPath(pathname: string): string {
  return pathname.replace(/^\/+|\/+$/g, "");
}

export function getStaticMarkdownPage(key: string): MarkdownPage | undefined {
  return Object.hasOwn(markdownPages, key) ? markdownPages[key] : undefined;
}

export type CatalogPageCheck =
  ProductListingPageCheck | ProductDetailPageCheck | "not-found" | null;

/** Parse the catalog's public URL shapes after decoding individual path segments. */
export function getCatalogPageCheck(
  segments: readonly string[],
  searchParams: URLSearchParams
): CatalogPageCheck {
  if (segments[0] !== "products") return null;
  if (
    segments.some(
      (segment) => !segment || segment === "." || segment === ".." || /[/\\]/.test(segment)
    )
  ) {
    return "not-found";
  }

  const [, category, subcategory, product, pageNumber] = segments;
  switch (segments.length) {
    case 1: {
      const pageValues = searchParams.getAll("page");
      if (pageValues.length > 1) return "not-found";
      const page = parsePositivePageNumber(pageValues[0] ?? "1");
      return page === null ? "not-found" : { type: "all", page };
    }
    case 2:
      if (category === "search") return null;
      return category === "page" ? "not-found" : { type: "category", category, page: 1 };
    case 3: {
      if (subcategory === "page" && category === "page") return "not-found";
      if (category !== "page") return { type: "subcategory", category, subcategory, page: 1 };
      const page = parsePositivePageNumber(subcategory);
      return page === null ? "not-found" : { type: "all", page };
    }
    case 4: {
      if (category === "page") return "not-found";
      if (subcategory !== "page") {
        return { type: "product", category, subcategory, product, key: searchParams.get("key") };
      }
      const page = parsePositivePageNumber(product);
      return page === null ? "not-found" : { type: "category", category, page };
    }
    case 5: {
      if (product !== "page" || category === "page" || subcategory === "page") {
        return "not-found";
      }
      const page = parsePositivePageNumber(pageNumber);
      return page === null ? "not-found" : { type: "subcategory", category, subcategory, page };
    }
    default:
      return "not-found";
  }
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
