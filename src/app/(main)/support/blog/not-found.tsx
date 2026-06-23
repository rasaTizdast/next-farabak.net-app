import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

const NotFound = () => {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-4 text-4xl font-bold text-gray-800">مقاله‌ای یافت نشد</h2>
      <p className="mb-6 text-lg text-gray-600">
        متأسفیم، اما مقاله‌ای با این مشخصات در سایت موجود نیست.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-blue-600 px-6 py-2 text-white shadow-md transition-all hover:bg-blue-700"
      >
        بازگشت به صفحه اصلی
      </Link>
      <Image
        src="/404.png"
        alt="تصویر ۴۰۴"
        width={700}
        height={600}
        quality={100}
        className="mt-10"
      />
    </div>
  );
};

export default NotFound;
