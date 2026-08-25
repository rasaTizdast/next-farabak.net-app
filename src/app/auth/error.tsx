"use client";

import { ErrorPage } from "@/components/ui/ErrorPage";

export default function AuthError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorPage
      statusCode={500}
      title="خطا در بارگذاری صفحه"
      message="متأسفانه خطایی رخ داده است. لطفاً مجدداً تلاش کنید."
      onRetry={reset}
    />
  );
}
