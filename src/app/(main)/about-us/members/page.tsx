export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import styles from "./Members.module.css";

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

export const metadata: Metadata = {
  title: "اعضای هیئت مدیره | فرابک",
  description: "مشاهده اعضای هیئت مدیره به‌همراه تجربیات و نقش های کلیدی هر یک از اعضای هیئت مدیره",
  robots: {
    index: true,
    follow: true,
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
      next: { revalidate: 120 }, // Revalidate every hour
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

  // Prepare structured data for Schema.org
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["AboutPage", "ItemList"],
    name: "اعضای هیئت مدیره فرابک",
    description:
      "مشاهده اعضای هیئت مدیره به‌همراه تجربیات و نقش های کلیدی هر یک از اعضای هیئت مدیره",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/members`,
    numberOfItems: members.length,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "صفحه اصلی",
          item: process.env.NEXT_PUBLIC_BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "درباره ما",
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "اعضای هیئت مدیره",
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/members`,
        },
      ],
    },
    isPartOf: {
      "@type": "WebSite",
      url: process.env.NEXT_PUBLIC_BASE_URL,
    },
    mainEntity: {
      "@type": "Organization",
      name: "فرابک",
      url: process.env.NEXT_PUBLIC_BASE_URL,
      member: members.map((member) => ({
        "@type": "Person",
        name: member.Name,
        jobTitle: member.Role,
        image: `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/member-images/${member.main_pic}`,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/members/${member.Slug}`,
        worksFor: {
          "@type": "Organization",
          name: "فرابک",
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
    </>
  );
};

export default Members;
