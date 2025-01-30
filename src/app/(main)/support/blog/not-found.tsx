import Image from "next/image";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        مقاله‌ای یافت نشد
      </h2>
      <p className="text-lg text-gray-600 mb-6">
        متأسفیم، اما مقاله‌ای با این مشخصات در سایت موجود نیست.
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
      >
        بازگشت به صفحه اصلی
      </Link>
      <Image src="/404.png" alt="" width={700} height={600} quality={100} className="mt-10"/>
    </div>
  );
};

export default NotFound;
