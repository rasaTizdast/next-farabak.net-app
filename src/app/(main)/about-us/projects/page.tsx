export const dynamic = "force-dynamic"; // To ensure this page isn't statically generated

import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

import projects from "@/constants/projects.json";
import styles from "./page.module.css";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "مشاهده پروژه های انجام شده توسط شرکت | فرابک",
  description:
    "شما در این صفحه میتوانید اطلاعاتی درباره پروژه های شرکت فرابک مشاهده کنید.",
};

const ProjectsPage = () => {
  const breadCrumbs = ["/", "/about-us", "/about-us/projects"];
  return (
    <div className={styles.projectsParent}>
      <Breadcrumb breadcrumbs={breadCrumbs} />
      <main className={styles.projects}>
        {projects.map((item) => (
          <Card key={item.id} data={item} />
        ))}
      </main>
    </div>
  );
};

type CardProps = {
  data: {
    id: number;
    title: string;
    smallDesc: string;
    mainImg: string;
    date: string;
    location: string;
    slug: string;
  };
};

const Card = ({ data }: CardProps) => {
  return (
    <div className={styles.card}>
      <Image
        src={data.mainImg}
        alt={data.title}
        width={1000}
        height={700}
        quality={100}
      />
      <h2>{data.title}</h2>
      <div className={styles.date}>{data.date}</div>
      <div className={styles.location}>{data.location}</div>
      <p>{data.smallDesc}</p>
      <Link href={`projects/${data.slug}`}>مشاهده</Link>
    </div>
  );
};

export default ProjectsPage;
