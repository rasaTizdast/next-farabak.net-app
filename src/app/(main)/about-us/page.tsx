import { cn } from "@/lib/utils";
export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";

import aboutUsData from "@/constants/aboutUs.json";

export const metadata: Metadata = {
  title: "درباره ما | تاریخچه و فعالیت‌های فرابک",
  description:
    "با فرابک آشنا شوید: شرکتی متخصص در واردات و توزیع تجهیزات امنیتی مانند دوربین‌های ریولینک، دستگاه‌های ایکس‌ری و محصولات بلک مجیک با گارانتی معتبر. بیش از ربع قرن تجربه در پروژه‌های نظارتی. برای همکاری تماس بگیرید.",
  robots: {
    index: true,
    follow: true,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "درباره ما",
  url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us`,
  description: "اطلاعات درباره شرکت فرابک، پروژه‌ها، اعضای هیئت مدیره و فعالیت‌های شرکت",
  isPartOf: {
    "@type": "WebSite",
    url: process.env.NEXT_PUBLIC_BASE_URL,
  },
  mainEntity: {
    "@type": "Organization",
    name: "فرابک",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    sameAs: [
      `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/projects`,
      `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/members`,
      `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/activity`,
    ],
  },
};

const AboutUs = () => {
  const jsonLd = JSON.stringify(structuredData);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center px-6 py-12 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40"
        )}
        dir="rtl"
      >
        <div
          className={cn("flex w-full max-w-[1580px] flex-wrap items-stretch justify-evenly gap-8")}
        >
          {aboutUsData.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              desc={item.desc}
              link={`/about-us/${item.link}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default AboutUs;

type CardProps = {
  title: string;
  desc: string;
  link: string;
};

const Card = ({ title, desc, link }: CardProps) => {
  return (
    <div
      className={cn(
        "bg-secondary flex max-w-[300px] flex-col items-center justify-between gap-4 rounded-lg p-4 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:scale-[1.05]"
      )}
    >
      <h2 className="text-[1.3rem] font-bold">{title}</h2>
      <p>{desc}</p>
      <Link
        href={link}
        className={cn(
          "bg-primary after:bg-fourth relative mt-8 inline-block w-full overflow-hidden rounded-lg px-8 py-2 text-[0.9rem] text-white transition-[transform,color,box-shadow] duration-300 after:absolute after:inset-y-0 after:inset-s-[100%] after:inset-e-0 after:z-[-1] after:transition-[inset-inline-start,inset-inline-end] after:duration-500 hover:scale-[1.03] hover:text-white hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)] hover:after:inset-s-0 hover:after:inset-e-0"
        )}
      >
        مشاهده
      </Link>
    </div>
  );
};
