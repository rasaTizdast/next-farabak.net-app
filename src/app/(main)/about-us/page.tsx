export const dynamic = "force-dynamic"; // To ensure this page isn't statically generated

import { Metadata } from "next";
import Link from "next/link";

import aboutUsData from "@/constants/aboutUs.json";

import styles from "./AboutUs.module.css";

export const metadata: Metadata = {
  title: "درباره ما | تاریخچه و فعالیت‌های فرابک",
  description:
    "با فرابک آشنا شوید: شرکتی متخصص در واردات و توزیع تجهیزات امنیتی مانند دوربین‌های ریولینک، دستگاه‌های ایکس‌ری و محصولات بلک مجیک با گارانتی معتبر. بیش از ربع قرن تجربه در پروژه‌های نظارتی. برای همکاری تماس بگیرید.",
  robots: {
    index: true, // This sets the noindex directive
    follow: true, // Allows crawling of links on the page if needed
  },
};

const AboutUs = () => {
  // Prepare structured data for Schema.org
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className={styles.main}>
        <div className={styles.cards}>
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
    <div className={styles.card}>
      <h2>{title}</h2>
      <p>{desc}</p>
      <Link href={link}>مشاهده</Link>
    </div>
  );
};
