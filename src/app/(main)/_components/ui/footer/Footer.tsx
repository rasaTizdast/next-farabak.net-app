import { io } from "next/cache";
import Image from "next/image";
import { BsFillSignpostSplitFill } from "react-icons/bs";
import { FaInstagram, FaPhoneSquare, FaWhatsapp } from "react-icons/fa";

import Link from "@/components/NoPrefetchLink";
import { PublicShell } from "@/components/public/PublicShell";
import { getContactInfo } from "@/lib/data/contactUs";

const Footer = async () => {
  // Keep outage fallbacks out of the prerendered shell so later requests retry.
  await io();
  const currentYear = new Date().getFullYear().toString();
  const { address, phone_numbers } = await getContactInfo();

  return (
    <footer className="w-full bg-linear-to-b from-(--farabak-mega-menu-bg) to-(--farabak-footer-bg) py-12 text-[#cecece] md:py-14">
      <PublicShell className="flex flex-col gap-10">
        <div className="grid w-full grid-cols-1 gap-x-8 gap-y-10 border-b border-[#2a425b] pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <nav
            aria-label="صفحات اصلی"
            className="flex flex-col items-center text-center lg:items-start lg:text-start"
          >
            <h4 className="mb-3 text-base font-bold text-white">صفحات اصلی</h4>
            <ul className="flex w-full flex-col gap-2">
              <li>
                <Link
                  href="/"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff] lg:justify-start"
                >
                  <span className="hidden sm:inline">صفحه اصلی</span>
                  <span className="sm:hidden">خانه</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff] lg:justify-start"
                >
                  محصولات
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff] lg:justify-start"
                >
                  درباره ما
                </Link>
              </li>
            </ul>
          </nav>
          <nav
            aria-label="پشتیبانی"
            className="flex flex-col items-center text-center lg:items-start lg:text-start"
          >
            <h4 className="mb-3 text-base font-bold text-white">
              <Link
                href="/support"
                className="text-white transition-colors hover:text-[#00bfff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff]"
              >
                پشتیبانی
              </Link>
            </h4>
            <ul className="flex w-full flex-col gap-2">
              <li>
                <Link
                  href="/support/warranty-tracking"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff] lg:justify-start"
                >
                  پیگیری گارانتی
                </Link>
              </li>
              <li>
                <Link
                  href="/support/download-center"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff] lg:justify-start"
                >
                  نرم‌افزارها و آپدیت‌ها
                </Link>
              </li>
              <li>
                <Link
                  href="/support/faq"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff] lg:justify-start"
                >
                  سوالات متداول
                </Link>
              </li>
            </ul>
          </nav>
          <nav
            aria-label="شرکت فرابک"
            className="flex flex-col items-center text-center lg:items-start lg:text-start"
          >
            <h4 className="mb-3 text-base font-bold text-white">
              <Link
                href="/about-us"
                className="text-white transition-colors hover:text-[#00bfff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff]"
              >
                شرکت فرابک
              </Link>
            </h4>
            <ul className="flex w-full flex-col gap-2">
              <li>
                <Link
                  href="/about-us/projects"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff] lg:justify-start"
                >
                  پروژه‌ها
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us/activity"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff] lg:justify-start"
                >
                  فعالیت شرکت
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us/members"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff] lg:justify-start"
                >
                  اعضای هیئت مدیره
                </Link>
              </li>
            </ul>
          </nav>
          <nav
            aria-label="شبکه‌های مجازی"
            className="flex flex-col items-center text-center lg:items-start lg:text-start"
          >
            <h4 className="mb-3 text-base font-bold text-white">شبکه‌های مجازی</h4>
            <ul className="flex w-full flex-col gap-2">
              <li>
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.instagram.com/farabak_cctv"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff] lg:justify-start"
                >
                  <FaInstagram className="text-[1rem]" aria-hidden="true" />
                  اینستاگرام
                </Link>
              </li>
              <li>
                <Link
                  href="https://wa.me/989121007066"
                  className="flex justify-center gap-2 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff] lg:justify-start"
                >
                  <FaWhatsapp className="text-[1rem]" aria-hidden="true" />
                  واتس‌آپ
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="grid w-full items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <address className="text-center not-italic lg:text-start" aria-label="آدرس دفتر مرکزی">
            <h5 className="mb-4 text-base font-bold text-white">آدرس دفتر مرکزی</h5>
            {address && (
              <>
                <div className="flex flex-col gap-4 text-[0.85rem] leading-[1.8] font-light text-[#c7c7c7]">
                  <div className="flex justify-center gap-2 lg:justify-start">
                    <span>{address.address}</span>
                  </div>
                  <div className="flex flex-col items-center gap-3 sm:grid sm:grid-cols-2 sm:items-start lg:grid-cols-3">
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
                          className="whitespace-nowrap text-[#cecece] transition-colors hover:text-[#00bfff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00bfff]"
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
          <figure className="overflow-hidden rounded-2xl border border-white/15 bg-white/5">
            <Image
              src="/contact/location-map.svg"
              alt="نمایش تصویری موقعیت دفتر مرکزی فرابک"
              width={900}
              height={520}
              loading="lazy"
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="px-4 py-3 text-center text-xs text-slate-300">
              موقعیت دفتر مرکزی فرابک
            </figcaption>
          </figure>
        </div>

        <div className="w-full border-t border-[#2a425b] pt-6">
          <p className="text-center text-[0.8rem] leading-5 text-[#888]">
            کلیه حقوق مادی و معنوی این سایت متعلق به شرکت فرابک می‌باشد &copy; {currentYear}
          </p>
        </div>
      </PublicShell>
    </footer>
  );
};

export default Footer;
