"use client";

import { PublicShell } from "@/components/public/PublicShell";
import { ErrorPage } from "@/components/ui/ErrorPage";

export default function AboutUsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <PublicShell as="main" className="py-16">
      <ErrorPage
        statusCode={500}
        title="خطا در بارگذاری صفحه"
        message="متأسفانه در دریافت اطلاعات خطایی رخ داده است. لطفاً مجدداً تلاش کنید."
        onRetry={reset}
      />
    </PublicShell>
  );
}
