import activityData from "@/constants/activityData.json";
import styles from "./ActivityPage.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "فعالیت‌های شرکت فرابک | فرابک",
  description:
    "شما در این صفحه میتوانید اطلاعاتی درباره فعالیت های شرکت فرابک مشاهده کنید.",
};

const ActivityPage = () => {
  return (
    <div className={styles.parent}>
      {activityData.map((item) => (
        <Card key={item.id} data={item} />
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
