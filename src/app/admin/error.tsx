"use client";

import { ErrorPage } from "@/components/ui/ErrorPage";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-80 items-center justify-center px-4 py-12">
      <ErrorPage
        statusCode={500}
        title="پنل مدیریت در دسترس نیست"
        message="متأسفانه دریافت اطلاعات پنل با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید."
        onRetry={reset}
      />
    </div>
  );
}
