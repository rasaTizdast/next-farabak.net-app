export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
    <div className="relative flex w-[20%] max-w-[300px] min-w-[300px] flex-col justify-between rounded-lg bg-white p-4 text-start shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:min-w-[250px]">
      <div className="text-center">
        <Image
          src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/member-images/${img}`}
          alt={name}
          width={200}
          height={150}
          quality={75}
          loading="lazy"
          className="rounded-lg"
        />
      </div>
      <h2 className="mt-2 mb-4 text-center text-[1.1rem]"> {name}</h2>
      <p className="mt-2 text-center">{role}</p>
      <Link
        href={`/about-us/members/${slug}`}
        className="relative mt-6 inline-block w-full overflow-hidden rounded-lg bg-[#1e90ff] px-8 py-2 text-center text-[0.9rem] text-white transition-[transform,color,box-shadow] duration-300 after:absolute after:inset-y-0 after:inset-s-[100%] after:inset-e-0 after:z-[-1] after:bg-[#0e6aff] after:transition-[inset-inline-start,inset-inline-end] after:duration-500 hover:scale-[1.03] hover:text-white hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)] hover:after:inset-s-0 hover:after:inset-e-0"
      >
        مشاهده
      </Link>
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
      next: { revalidate: 120 },
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
    return <div className="py-8 text-center text-red-500">هیچ عضوی یافت نشد</div>;
  }

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

  const jsonLd = JSON.stringify(structuredData);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="flex w-full max-w-[1580px] flex-wrap items-stretch justify-evenly gap-8">
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
