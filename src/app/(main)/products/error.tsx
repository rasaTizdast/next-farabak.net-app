"use client";

import { ActionLink } from "@/components/public/ActionLink";

export default function ProductsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center gap-5 px-5 py-16 text-center">
      <p className="text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
        کاتالوگ فرابک
      </p>
      <h1 className="text-3xl font-bold text-(--farabak-ink-deep)">دریافت محصولات ممکن نشد</h1>
      <p className="max-w-md text-base leading-8 text-(--farabak-ink-muted)">
        در ارتباط با کاتالوگ مشکلی پیش آمد. دوباره تلاش کنید یا برای انتخاب تجهیزات با کارشناسان ما
        در ارتباط باشید.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-(--farabak-action-blue) px-4 py-2 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          تلاش مجدد
        </button>
        <ActionLink href="/contact-us" variant="secondary">
          ارتباط با کارشناسان
        </ActionLink>
      </div>
    </section>
  );
}
