import { cacheLife } from "next/cache";
import Link from "next/link";
import { BsFillSignpostSplitFill } from "react-icons/bs";
import { FaInstagram, FaPhoneSquare, FaWhatsapp } from "react-icons/fa";

import { getContactInfo } from "@/lib/data/contactUs";

async function getCopyrightYear(): Promise<string> {
  "use cache";
  cacheLife("hours");
  return new Date().getFullYear().toString();
}

const Footer = async () => {
  const { address, phone_numbers } = await getContactInfo();
  const currentYear = await getCopyrightYear();

  return (
    <footer className="flex w-full justify-center bg-[#000814] px-6 py-12 pb-8 text-[#cecece] min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40">
      <div className="mx-auto flex w-full max-w-[1580px] flex-col items-center justify-between gap-6 min-[576px]:gap-8">
        <div className="w-full grid-cols-1 gap-10 border-b border-amber-50 pb-5 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-8 2xl:gap-6">
          <nav aria-label="صفحات اصلی" className="flex flex-col items-center text-center">
            <h4 className="mb-3 text-sm font-bold text-white max-[768px]:text-sm max-[576px]:text-xs md:text-base lg:text-base 2xl:text-[1.2rem]">
              صفحات اصلی
            </h4>
            <ul className="flex w-full flex-col gap-2">
              <li>
                <Link
                  href="/"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
                >
                  <span className="hidden sm:inline">صفحه اصلی</span>
                  <span className="sm:hidden">خانه</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
                >
                  محصولات
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
                >
                  درباره ما
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="پشتیبانی" className="mt-6 flex flex-col items-center text-center">
            <h4 className="mb-3 text-sm font-bold text-white max-[768px]:text-sm max-[576px]:text-xs">
              <Link href="/support" className="text-white transition-colors hover:text-[#00bfff]">
                پشتیبانی
              </Link>
            </h4>
            <ul className="flex w-full flex-col gap-2">
              <li>
                <Link
                  href="/support/warranty-tracking"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
                >
                  پیگیری گارانتی
                </Link>
              </li>
              <li>
                <Link
                  href="/support/download-center"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
                >
                  نرم‌افزارها و آپدیت‌ها
                </Link>
              </li>
              <li>
                <Link
                  href="/support/faq"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
                >
                  سوالات متداول
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="شرکت فرابک" className="mt-6 flex flex-col items-center text-center">
            <h4 className="mb-3 text-sm font-bold text-white max-[768px]:text-sm max-[576px]:text-xs">
              <Link href="/about-us" className="text-white transition-colors hover:text-[#00bfff]">
                شرکت فرابک
              </Link>
            </h4>
            <ul className="flex w-full flex-col gap-2">
              <li>
                <Link
                  href="/about-us/projects"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
                >
                  پروژه‌ها
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us/activity"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
                >
                  فعالیت شرکت
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us/members"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
                >
                  اعضای هیئت مدیره
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="شبکه‌های مجازی" className="mt-6 flex flex-col items-center text-center">
            <h4 className="mb-3 text-sm font-bold text-white max-[768px]:text-sm max-[576px]:text-xs">
              شبکه‌های مجازی
            </h4>
            <ul className="flex w-full flex-col gap-2">
              <li>
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.instagram.com/farabak_cctv"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
                >
                  <FaInstagram className="text-[1rem]" aria-hidden="true" />
                  اینستاگرام
                </Link>
              </li>
              <li>
                <Link
                  href="https://wa.me/989121007066"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
                >
                  <FaWhatsapp className="text-[1rem]" aria-hidden="true" />
                  واتس‌آپ
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-2 grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          <address className="not-italic" aria-label="آدرس دفتر مرکزی">
            <h5 className="mb-4 text-base font-bold text-white">آدرس دفتر مرکزی</h5>
            {address && (
              <>
                <div className="flex flex-col gap-3 text-start text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7]">
                  <div className="flex gap-2">
                    <span>{address.address}</span>
                  </div>
                  <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex gap-2">
                      <BsFillSignpostSplitFill
                        className="shrink-0 text-[#00bfff]"
                        aria-hidden="true"
                      />
                      <span>{address.postal_code}</span>
                    </div>
                    {phone_numbers.map((phone) => (
                      <div key={phone.id} className="flex items-center gap-2">
                        <FaPhoneSquare className="shrink-0 text-[#00bfff]" aria-hidden="true" />
                        <Link
                          href={`tel:${phone.number}`}
                          className="whitespace-nowrap text-[#cecece] transition-colors hover:text-[#00bfff]"
                        >
                          {phone.number}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </address>
          <iframe
            title="فرابک - آدرس دفتر مرکزی"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1360.8932132644327!2d51.35469992463351!3d35.78108017399431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e07b684c2b9d5%3A0x703fbc3293eb71d6!2sFARABAK%20Head%20Office%20Company!5e0!3m2!1sen!2s!4v1711904970824!5m2!1sen!2s"
            sandbox="allow-scripts allow-same-origin allow-popups"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[350px] w-full rounded-lg max-[768px]:h-[250px] max-[576px]:h-[200px] md:h-[300px]"
          />
        </div>

        <div className="mt-8 w-full border-t border-[#2a2a2a] pt-6">
          <p className="text-center text-[0.8rem] leading-5 text-[#888]">
            کلیه حقوق مادی و معنوی این سایت متعلق به شرکت فرابک می‌باشد &copy; {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
