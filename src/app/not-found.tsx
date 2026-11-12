import Link from "next/link";

import { ErrorPage } from "@/components/ui/ErrorPage";

const helpfulLinks = [
  { href: "/", label: "صفحه اصلی" },
  { href: "/products", label: "فروشگاه محصولات" },
  { href: "/support", label: "مرکز پشتیبانی" },
  { href: "/about-us", label: "درباره ما" },
  { href: "/contact-us", label: "تماس با ما" },
];

export default function NotFound() {
  return (
    <ErrorPage statusCode={404} title="صفحه یافت نشد" message="صفحه مورد نظر شما وجود ندارد">
      <nav aria-label="لینک‌های مفید" className="flex flex-wrap justify-center gap-3">
        {helpfulLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-primary hover:text-secondary hover:underline"
          >
            {link.label}
          </Link>
        ))}
        <a href="/sitemap.xml" className="text-primary hover:text-secondary hover:underline">
          نقشه سایت
        </a>
        <a href="/llms.txt" className="text-primary hover:text-secondary hover:underline">
          راهنمای عامل‌های هوشمند (llms.txt)
        </a>
      </nav>
    </ErrorPage>
  );
}
