export const dynamic = "force-dynamic"; // To ensure this page isn't statically generated

import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

import styles from "./page.module.css";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "گالری تصاویر پروژه ها | فرابک",
  description:
    "شما در این صفحه میتوانید اطلاعاتی درباره پروژه های شرکت فرابک مشاهده کنید.",
  robots: {
    index: false,
    follow: false,
  },
};

async function getProjects() {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/projects`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

const ProjectsPage = async () => {
  const breadCrumbs = ["/", "/about-us", "/about-us/projects"];
  const projects = await getProjects();

  return (
    <div className={styles.projectsParent}>
      <Breadcrumb breadcrumbs={breadCrumbs} />
      <main className={styles.projects}>
        {projects.length > 0 ? (
          projects.map((item) => <Card key={item.id} data={item} />)
        ) : (
          <div className={styles.emptyState}>
            <p>هیچ پروژه ای یافت نشد</p>
          </div>
        )}
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
  // Truncate description to 160 characters
  const truncatedDescription =
    data.smallDesc.length > 160
      ? `${data.smallDesc.substring(0, 160)}...`
      : data.smallDesc;

  return (
    <div className={styles.card}>
      <Image
        src={`${process.env.LIARA_BUCKET_URL}/${data.mainImg}`}
        alt={data.title}
        width={1000}
        height={700}
        quality={100}
      />
      <h2>{data.title}</h2>
      <div className={styles.date}>
        {new Date(data.date).toLocaleDateString("fa")}
      </div>
      <div className={styles.location}>{data.location}</div>
      <p>{truncatedDescription}</p>
      <Link href={`projects/${data.slug}`}>مشاهده</Link>
    </div>
  );
};

export default ProjectsPage;
