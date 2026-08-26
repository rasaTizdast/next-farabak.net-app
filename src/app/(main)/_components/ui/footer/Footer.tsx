import Link from "next/link";
import { BsFillSignpostSplitFill } from "react-icons/bs";
import { FaInstagram, FaPhoneSquare, FaWhatsapp } from "react-icons/fa";

import { prisma } from "@/lib/prisma";

const Footer = async () => {
  const [address, phones] = await Promise.all([
    prisma.address.findFirst(),
    prisma.phone_numbers.findMany(),
  ]);
  const phone_numbers = phones.filter((phone) => phone.number && phone.number.trim() !== "");

  return (
    <footer className="flex w-full justify-center bg-[#000814] px-[10rem] py-12 text-[#cecece] md:px-[6rem] md:py-4 lg:px-[4rem] xl:px-[3rem] 2xl:px-[1.5rem]">
      <div className="flex w-full max-w-[calc(1900px-20rem)] flex-col items-center justify-between gap-6">
        <div className="mb-8 flex w-full flex-wrap items-start justify-evenly border-b border-[#aaa] pb-[1.1rem] md:flex-nowrap lg:gap-4 2xl:gap-2">
          <div className="flex min-h-[120px] min-w-[130px] flex-col">
            <h4 className="mb-4 text-base font-bold transition-colors duration-300 md:text-base lg:text-base 2xl:text-[1.2rem]">
              صفحات اصلی
            </h4>
            <div className="flex w-[80%] flex-col gap-6">
              <Link
                href="/"
                className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
              >
                صفحه اصلی
              </Link>
              <Link
                href="/products"
                className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
              >
                محصولات
              </Link>
              <Link
                href="/about-us"
                className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
              >
                درباره ما
              </Link>
            </div>
          </div>
          <div className="flex min-h-[120px] min-w-[130px] flex-col">
            <h4 className="mb-4 text-base font-bold transition-colors duration-300">
              <Link href="/support" className="text-[#cecece]">
                پشتیبانی
              </Link>
            </h4>
            <div className="flex w-[80%] flex-col gap-6">
              <Link
                href="/support/warranty-tracking"
                className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
              >
                پیگیری گارانتی
              </Link>
              <Link
                href="/support/download-center"
                className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
              >
                نرم‌افزارها و آپدیت‌ها
              </Link>
              <Link
                href="/support/faq"
                className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
              >
                سوالات متداول
              </Link>
            </div>
          </div>
          <div className="flex min-h-[120px] min-w-[130px] flex-col">
            <h4 className="mb-4 text-base font-bold transition-colors duration-300">
              <Link href="/about-us" className="text-[#cecece]">
                شرکت فرابک
              </Link>
            </h4>
            <div className="flex w-[80%] flex-col gap-6">
              <Link
                href="/about-us/projects"
                className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
              >
                پروژه‌ها
              </Link>
              <Link
                href="/about-us/activity"
                className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
              >
                فعالیت شرکت
              </Link>
              <Link
                href="/about-us/members"
                className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
              >
                اعضای هیئت مدیره
              </Link>
            </div>
          </div>
          <div className="flex min-h-[120px] min-w-[130px] flex-col">
            <h4 className="mb-4 text-base font-bold transition-colors duration-300">
              شبکه‌های مجازی
            </h4>
            <div className="flex w-[80%] flex-col gap-6">
              <Link
                target="_blank"
                href="https://www.instagram.com/farabak_cctv"
                className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
              >
                <FaInstagram />
                اینستاگرام
              </Link>
              <Link
                href="https://wa.me/989121007066"
                className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] transition-[color,font-weight] duration-300 hover:font-medium hover:text-white"
              >
                <FaWhatsapp />
                واتس‌آپ
              </Link>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-evenly gap-5 md:flex-row lg:flex-row xl:flex-row 2xl:flex-row">
          <div className="flex-1">
            <div className="mb-0 text-base font-bold transition-colors duration-300">
              آدرس دفتر مرکزی
            </div>
            {address && (
              <>
                <div className="mt-6 flex w-full gap-2 text-start text-[0.8rem] leading-[1.8] leading-[1rem] font-light text-[#c7c7c7]">
                  <BsFillSignpostSplitFill />
                  <span>{address.postal_code}</span>
                </div>
                <div className="mt-6 flex flex-col flex-wrap justify-center gap-5 md:flex-row">
                  <div className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] md:w-auto">
                    <BsFillSignpostSplitFill />
                    <span>{address.postal_code}</span>
                  </div>
                  {phone_numbers.map((phone) => (
                    <div
                      key={phone.id}
                      className="flex w-full gap-2 text-[0.8rem] leading-[1rem] font-light text-[#c7c7c7] md:w-auto"
                    >
                      <FaPhoneSquare />
                      <Link href={`tel:${phone.number}`} className="text-[#cecece]">
                        {phone.number}
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <iframe
            title="فرابک - آدرس دفتر مرکزی"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1360.8932132644327!2d51.35469992463351!3d35.78108017399431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e07b684c2b9d5%3A0x703fbc3293eb71d6!2sFARABAK%20Head%20Office%20Company!5e0!3m2!1sen!2s!4v1711904970824!5m2!1sen!2s"
            sandbox="allow-scripts allow-same-origin allow-popups"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="mt-0 h-[350px] w-full flex-1 md:mt-6 md:h-[300px]"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
