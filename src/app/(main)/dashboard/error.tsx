"use client";

import { ErrorPage } from "@/components/ui/ErrorPage";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-80 items-center justify-center px-4 py-12">
      <ErrorPage
        statusCode={500}
        title="میز کار در دسترس نیست"
        message="متأسفانه دریافت اطلاعات حساب با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید."
        onRetry={reset}
      />
    </div>
  );
}
