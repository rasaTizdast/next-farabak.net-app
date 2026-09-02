import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { getMembers } from "@/lib/data/members";

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
    <div className="relative flex w-[20%] max-w-[300px] min-w-[300px] flex-col justify-between rounded-lg bg-white p-4 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)] max-[768px]:min-w-[250px]">
      <Image
        src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/member-images/${img}`}
        alt={name}
        width={200}
        height={150}
        quality={75}
        loading="lazy"
        className="h-[200px] w-full rounded-lg object-cover"
      />
      <h2 className="mt-4 mb-2 text-[1.1rem] max-[768px]:text-[1rem]"> {name}</h2>
      <p className="mt-2 max-[768px]:text-[0.9rem]">{role}</p>
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

const fetchMembers = async (): Promise<Member[]> => {
  try {
    return await getMembers();
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
};

const membersBreadcrumbs = ["/", "/about-us", "/about-us/members"];

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
      "@id": "https://farabak.net",
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
        affiliation: {
          "@id": "https://farabak.net",
        },
        areaServed: {
          "@type": "Country",
          name: "Iran",
        },
        keywords: [
          ...new Set(
            [
              ...(member.Role ? member.Role.split(/\s+/) : []),
              "فرابک",
              "هیئت مدیره",
              "دوربین مداربسته",
              "نظارت تصویری",
              "فلزیاب",
              "ایکس‌ری",
            ].filter((word) => word.length >= 2)
          ),
        ],
      })),
    },
  };

  const jsonLd = JSON.stringify(structuredData);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="w-full max-w-[1580px]">
        <Breadcrumb breadcrumbs={membersBreadcrumbs} />
        <div className="flex w-full flex-wrap items-stretch justify-evenly gap-8">
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
      </div>
    </>
  );
};

export default Members;
