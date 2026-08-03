"use client";

import { ErrorPage } from "@/components/ui/ErrorPage";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorPage statusCode={500} title="خطا در بارگذاری پنل مدیریت" message="متأسفانه در دریافت اطلاعات خطایی رخ داده است." onRetry={reset} />;
}
