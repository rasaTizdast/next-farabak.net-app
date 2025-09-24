// app/activity/page.tsx
export const dynamic = "force-dynamic";

import { Metadata } from "next";

import styles from "./ActivityPage.module.css";

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
  Details_activity: DetailsActivity[]; // Use `Details_activity` instead of `details`
};

const Card = ({ data: { title, items } }: CardProps) => {
  return (
    <section className={styles.section}>
      <h1>{title}</h1>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
};

const ActivityPage = async () => {
  const response = await fetch(`${process.env.BASE_URL}/api/activities`, {
    next: { revalidate: 3600 },
  });

  const activities = await response.json();

  // Prepare structured data for Schema.org
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className={styles.parent}>
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
