export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";

import styles from "./DownloadCenterPage.module.css";

export const metadata: Metadata = {
  title: "مرکز دانلود نرم‌افزار و آپدیت | فرابک",
  description:
    "دانلود رایگان نرم‌افزار، راهنماها و بروزرسانی‌های محصولات ریولینک، بلک مجیک و دستگاه‌های ایکس‌ری از فرابک. دسترسی آسان برای کاربران خرید دوربین مداربسته و سیستم‌های امنیتی.",
  robots: {
    index: true, // This sets the noindex directive
    follow: true, // Allows crawling of links on the page if needed
  },
};

const DownloadCenterPage = () => {
  return (
    <section className={styles.downloadParent}>
      <div className={styles.card}>
        <h3>برنامه رئولینک</h3>
        <div className={styles.details}>
          <p>
            با دانلود برنامه رئولینک شما میتوانید به سادگی دوربین های خود را کنترل، تنظیم و بررسی
            کنید.
          </p>

          <Link href="https://play.google.com/store/apps/details?id=com.mcu.reolink">
            دریافت اپلیکیشن اندروید رئولینک
          </Link>

          <Link href="https://itunes.apple.com/us/app/reolink/id995927563?ls=1&mt=8">
            دریافت اپلیکیشن IOS رئولینک
          </Link>

          <Link href="https://home-cdn.reolink.us/wp-content/uploads/2024/07/241029151721816955.6833.exe?download_name=reolink_setup_8168_0.exe">
            دریافت اپلیکیشن Windows رئولینک
          </Link>

          <Link href="https://home-cdn.reolink.us/wp-content/uploads/2023/03/170224401679019880.5577.dmg?download_name=Reolink_Client_885.dmg">
            دریافت اپلیکیشن Mac رئولینک
          </Link>

          <Link href="https://reolink.com/software-and-manual/" className={styles.linkText}>
            دریافت جدید‌ترین نسخه اپلیکیشن برای Windows - Mac - IOS - Android از وبسایت رسمی رئولینک
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DownloadCenterPage;
