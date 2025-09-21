import Link from "next/link"; // Use Next.js Link for routing

import styles from "./SupportSection.module.css";
import supportData from "../../../constants/supportData.json";

const SupportSection = () => {
  return (
    <div className={styles.main}>
      <h2>پشتیبانی</h2>
      <div className={styles.cards}>
        {supportData.map((item) => (
          <Card key={item.id} title={item.title} desc={item.desc} link={item.link} />
        ))}
      </div>
    </div>
  );
};

export default SupportSection;

type card = {
  title: string;
  desc: string;
  link: string;
};

const Card = ({ title, desc, link }: card) => {
  return (
    <div className={styles.card}>
      <h5>{title}</h5>
      <p>{desc}</p>
      <Link href={`support/${link}`}>مشاهده</Link>
    </div>
  );
};
