// app/activity/page.tsx
export const dynamic = "force-dynamic";

import styles from "./ActivityPage.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "فعالیت های شرکت فرابک | فرابک",
  description:
    "شما در این صفحه میتوانید اطلاعاتی درباره فعالیت های شرکت فرابک مشاهده کنید.",
  robots: {
    index: false,
    follow: false,
  },
};

const ActivityPage = async () => {
  const response = await fetch(`${process.env.BASE_URL}/api/activities`, {
    next: { revalidate: 0 },
  });

  const activities = await response.json();

  return (
    <div className={styles.parent}>
      {activities.map((activity: any) => (
        <Card
          key={activity.id}
          data={{
            title: activity.title,
            items: activity.Details_activity.map(
              (detail: any) => detail.description
            ),
          }}
        />
      ))}
    </div>
  );
};

export default ActivityPage;

type CardProps = {
  data: {
    title: string;
    items: string[];
  };
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
