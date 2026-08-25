"use client";

import { ErrorPage } from "@/components/ui/ErrorPage";

export default function ProductsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorPage
      statusCode={500}
      title="خطا در دریافت محصولات"
      message="متأسفانه در دریافت لیست محصولات خطایی رخ داده است."
      onRetry={reset}
    />
  );
}
