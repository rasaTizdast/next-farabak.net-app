export const dynamic = "force-dynamic";

import { cn } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "مرکز دانلود نرم‌افزار و آپدیت | فرابک",
  description:
    "دانلود رایگان نرم‌افزار، راهنماها و بروزرسانی‌های محصولات ریولینک، بلک مجیک و دستگاه‌های ایکس‌ری از فرابک. دسترسی آسان برای کاربران خرید دوربین مداربسته و سیستم‌های امنیتی.",
  robots: {
    index: true,
    follow: true,
  },
};

const DownloadCenterPage = () => {
  return (
    <section className={cn("flex flex-col gap-6")}>
      <div
        className={cn(
          "bg-background w-full max-w-[800px] overflow-x-hidden rounded-lg py-4 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:max-w-[600px]"
        )}
      >
        <h3
          className={cn(
            "border-third mb-6 border-b-3 px-4 py-2 text-center text-[1.5rem] font-black min-[2000px]:text-[2rem]"
          )}
        >
          برنامه رئولینک
        </h3>
        <div className="w-full px-4">
          <p className="mb-5 font-medium">
            با دانلود برنامه رئولینک شما میتوانید به سادگی دوربین های خود را کنترل، تنظیم و بررسی
            کنید.
          </p>

          <Link
            href="https://play.google.com/store/apps/details?id=com.mcu.reolink"
            className={cn(
              "bg-third xs:hover:bg-dark-blue my-2 inline-block w-[60%] min-w-[130px] rounded-[6px] px-8 py-2 text-white transition-colors duration-300"
            )}
          >
            دریافت اپلیکیشن اندروید رئولینک
          </Link>

          <Link
            href="https://itunes.apple.com/us/app/reolink/id995927563?ls=1&mt=8"
            className={cn(
              "bg-third xs:hover:bg-dark-blue my-2 inline-block w-[60%] min-w-[130px] rounded-[6px] px-8 py-2 text-white transition-colors duration-300"
            )}
          >
            دریافت اپلیکیشن IOS رئولینک
          </Link>

          <Link
            href="https://home-cdn.reolink.us/wp-content/uploads/2024/07/241029151721816955.6833.exe?download_name=reolink_setup_8168_0.exe"
            className={cn(
              "bg-third xs:hover:bg-dark-blue my-2 inline-block w-[60%] min-w-[130px] rounded-[6px] px-8 py-2 text-white transition-colors duration-300"
            )}
          >
            دریافت اپلیکیشن Windows رئولینک
          </Link>

          <Link
            href="https://home-cdn.reolink.us/wp-content/uploads/2023/03/170224401679019880.5577.dmg?download_name=Reolink_Client_885.dmg"
            className={cn(
              "bg-third xs:hover:bg-dark-blue my-2 inline-block w-[60%] min-w-[130px] rounded-[6px] px-8 py-2 text-white transition-colors duration-300"
            )}
          >
            دریافت اپلیکیشن Mac رئولینک
          </Link>

          <Link
            href="https://reolink.com/software-and-manual/"
            className={cn(
              "xs:hover:bg-dark-blue mt-5 inline-block w-full rounded-[6px] bg-[#1d1d1d] px-8 py-2 font-light text-white transition-colors duration-300"
            )}
          >
            دریافت جدید‌ترین نسخه اپلیکیشن برای Windows - Mac - IOS - Android از وبسایت رسمی رئولینک
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DownloadCenterPage;
