export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";

import supportData from "@/constants/supportData.json";

import styles from "./SupportPage.module.css";

export const metadata: Metadata = {
  title: "بخش پشتیبانی شرکت فرابک | فرابک",
  description: "مشاهده صفحه های پشتیبانی شرکت فرابک",
  robots: {
    index: true, // This sets the noindex directive
    follow: true, // Allows crawling of links on the page if needed
  },
};

const SupportPage = () => {
  return (
    <section className={styles.section}>
      <div className={styles.cards}>
        {supportData.map((item) => (
          <Card key={item.id} title={item.title} desc={item.desc} link={item.link} />
        ))}
      </div>
    </section>
  );
};

export default SupportPage;

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
      <Link href={`/support/${link}`}>مشاهده</Link>
    </div>
  );
};
