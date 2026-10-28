import type { Metadata } from "next";

import { ActionLink } from "@/components/public/ActionLink";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

const NotFound = () => {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center gap-5 px-5 py-16 text-center">
      <p className="text-6xl font-bold text-(--farabak-action-blue)">۴۰۴</p>
      <h1 className="text-3xl font-bold text-(--farabak-ink-deep)">محصولی یافت نشد</h1>
      <p className="max-w-md text-base leading-8 text-(--farabak-ink-muted)">
        این مدل یا صفحه دیگر در دسترس نیست. از کاتالوگ محصولات شروع کنید یا برای راهنمایی با ما تماس
        بگیرید.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <ActionLink href="/products">بازگشت به کاتالوگ</ActionLink>
        <ActionLink href="/contact-us" variant="secondary">
          ارتباط با کارشناسان
        </ActionLink>
      </div>
    </section>
  );
};

export default NotFound;
