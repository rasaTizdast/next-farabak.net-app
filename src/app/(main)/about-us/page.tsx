export const dynamic = "force-dynamic"; // To ensure this page isn't statically generated

import Link from "next/link";
import { Metadata } from "next";

import aboutUsData from "@/constants/aboutUs.json";

import styles from "./AboutUs.module.css";

export const metadata: Metadata = {
  title: "بخش درباره ما | فرابک",
  description:
    "شما در این صفحه میتوانید اطلاعاتی درباره شرکت فرابک مشاهده کنید.",
  robots: {
    index: false, // This sets the noindex directive
    follow: false, // Allows crawling of links on the page if needed
  },
};

const AboutUs = () => {
  return (
    <>
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
