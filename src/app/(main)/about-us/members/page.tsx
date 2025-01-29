export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import styles from "./Members.module.css";

export const metadata: Metadata = {
  title: "اعضای هیئت مدیره | فرابک",
  description:
    "مشاهده اعضای هیئت مدیره به‌همراه تجربیات و نقش های کلیدی هر یک از اعضای هیئت مدیره",
  robots: {
    index: false,
    follow: false,
  },
};

type Member = {
  Membersid: number;
  Slug: string;
  Name: string;
  Role: string;
  main_pic: string;
};

const fetchMembers = async () => {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/members`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error("Failed to fetch members");
    }

    const members: Member[] = await response.json();
    return members;
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
};

const Members = async () => {
  const members = await fetchMembers();

  if (!members || members.length === 0) {
    return <div className={styles.error}>هیچ عضوی یافت نشد</div>;
  }

  return (
    <div className={styles.members}>
      {members.map((member) => (
        <Card
          key={member.Membersid}
          data={{
            id: member.Membersid,
            slug: member.Slug,
            name: member.Name,
            role: member.Role,
            img: member.main_pic,
          }}
        />
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
      <Image
        src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/member-images/${img}`}
        alt={name}
        width={200}
        height={150}
        quality={100}
        loading="lazy"
        className="rounded-lg"
      />
      <h2>{name}</h2>
      <p>{role}</p>
      <Link href={`/about-us/members/${slug}`}>مشاهده</Link>
    </div>
  );
};

export default Members;
