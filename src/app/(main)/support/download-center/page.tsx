import { Metadata } from "next";
import Link from "next/link";
import { FaAndroid, FaApple, FaAppStore, FaWindows } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

import { cn } from "@/lib/utils";

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
    <section className={cn("flex w-full flex-col items-center gap-8")}>
      <header className="flex flex-col items-center gap-3 text-center">
        <h1
          className={cn(
            "border-third text-foreground inline-block border-b-3 px-4 pb-3 text-2xl font-black min-[2000px]:text-[2rem] md:text-3xl"
          )}
        >
          برنامه رئولینک
        </h1>
        <p className="text-muted-foreground max-w-[560px] leading-8 font-medium">
          با دانلود برنامه رئولینک شما میتوانید به سادگی دوربین های خود را کنترل، تنظیم و بررسی
          کنید.
        </p>
      </header>

      <div
        className={cn(
          "bg-background mx-auto flex w-full max-w-[600px] flex-col items-center gap-3 overflow-x-hidden rounded-lg px-4 py-6 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
        )}
      >
        <Link
          href="https://play.google.com/store/apps/details?id=com.mcu.reolink"
          className={cn(
            "bg-third xs:hover:bg-dark-blue xs:w-[60%] xs:hover:-translate-y-0.5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-8 py-3 text-white transition-all duration-300"
          )}
        >
          <FaAndroid size={18} />
          دریافت اپلیکیشن اندروید رئولینک
        </Link>

        <Link
          href="https://itunes.apple.com/us/app/reolink/id995927563?ls=1&mt=8"
          className={cn(
            "bg-third xs:hover:bg-dark-blue xs:w-[60%] xs:hover:-translate-y-0.5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-8 py-3 text-white transition-all duration-300"
          )}
        >
          <FaAppStore size={18} />
          دریافت اپلیکیشن IOS رئولینک
        </Link>

        <Link
          href="https://home-cdn.reolink.us/wp-content/uploads/2024/07/241029151721816955.6833.exe?download_name=reolink_setup_8168_0.exe"
          className={cn(
            "bg-third xs:hover:bg-dark-blue xs:w-[60%] xs:hover:-translate-y-0.5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-8 py-3 text-white transition-all duration-300"
          )}
        >
          <FaWindows size={18} />
          دریافت اپلیکیشن Windows رئولینک
        </Link>

        <Link
          href="https://home-cdn.reolink.us/wp-content/uploads/2023/03/170224401679019880.5577.dmg?download_name=Reolink_Client_885.dmg"
          className={cn(
            "bg-third xs:hover:bg-dark-blue xs:w-[60%] xs:hover:-translate-y-0.5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-8 py-3 text-white transition-all duration-300"
          )}
        >
          <FaApple size={18} />
          دریافت اپلیکیشن Mac رئولینک
        </Link>

        <Link
          href="https://reolink.com/software-and-manual/"
          className={cn(
            "xs:hover:bg-dark-blue xs:hover:-translate-y-0.5 mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1d1d1d] px-8 py-3 font-light text-white transition-all duration-300"
          )}
        >
          دریافت جدید‌ترین نسخه اپلیکیشن برای Windows - Mac - IOS - Android از وبسایت رسمی رئولینک
          <FiExternalLink size={18} />
        </Link>
      </div>
    </section>
  );
};

export default DownloadCenterPage;
