"use client";

import { ErrorPage } from "@/components/ui/ErrorPage";

export default function BranchMyError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorPage statusCode={500} title="خطا در بارگذاری صفحه" message="متأسفانه در دریافت اطلاعات خطایی رخ داده است. لطفاً مجدداً تلاش کنید." onRetry={reset} />;
}
