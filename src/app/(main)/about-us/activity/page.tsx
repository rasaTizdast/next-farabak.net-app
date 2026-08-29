export const dynamic = "force-dynamic";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "فعالیت های شرکت فرابک | فرابک",
  description: "شما در این صفحه میتوانید اطلاعاتی درباره فعالیت های شرکت فرابک مشاهده کنید.",
  robots: {
    index: true,
    follow: true,
  },
};

type DetailsActivity = {
  id: number;
  activityID: number;
  description: string;
};

type MasterActivity = {
  id: number;
  title: string;
  Details_activity: DetailsActivity[];
};

const Card = ({ data: { title, items } }: CardProps) => {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-white p-8 shadow-[0px_8px_20px_rgba(0,0,0,0.1)] md:p-8 lg:p-8">
      <h1 className="text-[calc(0.9rem+0.5vw)] font-extrabold text-[#1e90ff]">{title}</h1>
      <ul className="list-square me-10 flex flex-col gap-4">
        {items.map((item, index) => (
          <li
            key={index}
            className="text-justify leading-loose font-medium hyphens-auto text-[#003262] md:text-[calc(0.8rem+0.5vw)] lg:text-[calc(0.8rem+0.5vw)] xl:text-[calc(0.7rem+0.5vw)]"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
};

const ActivityPage = async () => {
  const response = await fetch(`${process.env.BASE_URL}/api/activities`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const activities: MasterActivity[] = await response.json();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["AboutPage", "ItemList"],
    name: "فعالیت های شرکت فرابک",
    description: "اطلاعات درباره فعالیت ها، خدمات و تخصص های شرکت فرابک",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/activity`,
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
          name: "فعالیت های شرکت",
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/activity`,
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
      department: activities.map((activity) => ({
        "@type": "OrganizationRole",
        name: activity.title,
        description: activity.Details_activity.map((detail) => detail.description).join(" | "),
        roleName: "Service Provider",
      })),
    },
  };

  const jsonLd = JSON.stringify(structuredData);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="mb-4 flex w-full max-w-[1580px] flex-col gap-8">
        {activities.map((activity: MasterActivity) => (
          <Card
            key={activity.id}
            data={{
              title: activity.title,
              items: activity.Details_activity.map((detail) => detail.description),
            }}
          />
        ))}
      </div>
    </>
  );
};

export default ActivityPage;

type CardProps = {
  data: {
    title: string;
    items: string[];
  };
};
