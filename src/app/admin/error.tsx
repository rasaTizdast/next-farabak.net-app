"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">⚠️</div>
      <h2 className="mb-3 text-xl font-bold text-gray-800">خطا در بارگذاری پنل مدیریت</h2>
      <p className="mb-6 max-w-md text-sm text-gray-500">
        {error.message || "متأسفانه در دریافت اطلاعات خطایی رخ داده است."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-[#00bfff] px-8 py-3 text-white transition-colors hover:bg-[#318ce7]"
      >
        تلاش مجدد
      </button>
    </div>
  );
}
