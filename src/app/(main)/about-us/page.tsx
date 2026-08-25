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
      <div className="flex w-full flex-col items-center px-[10rem] py-12 md:px-[6rem] lg:px-[4rem] xl:px-[3rem] 2xl:px-[1.5rem]">
        <div className="flex w-full max-w-[calc(1900px-20rem)] flex-wrap items-stretch justify-evenly gap-8">
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
    <div className="flex max-w-[300px] flex-col items-center justify-between gap-4 rounded-lg bg-white p-4 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <h2 className="text-[1.3rem] font-bold">{title}</h2>
      <p>{desc}</p>
      <Link
        href={link}
        className="relative mt-8 inline-block w-full overflow-hidden rounded-lg bg-[#1e90ff] px-8 py-2 text-[0.9rem] text-white transition-[transform,color,box-shadow] duration-300 duration-400 after:absolute after:start-[100%] after:end-0 after:top-0 after:bottom-0 after:z-[-1] after:bg-[#0e6aff] after:transition-[inset-inline-start,inset-inline-end] after:duration-500 hover:scale-[1.03] hover:text-white hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)] hover:after:start-0 hover:after:end-0"
      >
        مشاهده
      </Link>
    </div>
  );
};
