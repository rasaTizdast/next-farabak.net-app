export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import styles from "./Members.module.css";

import members from "@/constants/members.json";

export const metadata: Metadata = {
  title: "اعضای هیئت مدیره | فرابک",
  description:
    "مشاهده اعضای هیئت مدیره به‌همراه تجربیات و نقش های کلیدی هر یک از اعضای هیئت مدیره",
  robots: {
    index: false, // This sets the noindex directive
    follow: false, // Allows crawling of links on the page if needed
  },
};

const Members = () => {
  return (
    <div className={styles.members}>
      {members.map((item) => (
        <Card key={item.id} data={item} />
      ))}
    </div>
  );
};

type CardProps = {
  data: {
    id: number;
    slug: string;
    name: string;
    role: string;
    img: string;
  };
};

const Card = ({ data: { slug, name, role, img } }: CardProps) => {
  return (
    <div className={styles.card}>
      <Image src={img} alt={name} width={200} height={150} quality={100} />
      <h2>{name}</h2>
      <p>{role}</p>
      <Link href={`/about-us/members/${slug}`}>مشاهده</Link>
    </div>
  );
};

export default Members;
