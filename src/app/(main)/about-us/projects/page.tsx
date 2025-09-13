export const dynamic = "force-dynamic"; // To ensure this page isn't statically generated

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "گالری تصاویر پروژه ها | فرابک",
  description: "شما در این صفحه میتوانید اطلاعاتی درباره پروژه های شرکت فرابک مشاهده کنید.",
  robots: {
    index: true,
    follow: true,
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

  // Prepare structured data for Schema.org
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["AboutPage", "CollectionPage"],
    name: "گالری تصاویر پروژه های فرابک",
    description:
      "مشاهده تصاویری از پروژه‌های انجام شده قبلی توسط تیم فرابک، به همراه توضیحات تکمیلی پروژه‌ها",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/projects`,
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
          name: "گالری تصاویر پروژه ها",
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/projects`,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Project",
          name: project.title,
          description: project.smallDesc,
          image: `${process.env.LIARA_BUCKET_URL}/${project.mainImg}`,
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/projects/${project.slug}`,
          location: {
            "@type": "Place",
            name: project.location,
          },
          datePublished: project.date,
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
    </>
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
    data.smallDesc.length > 160 ? `${data.smallDesc.substring(0, 160)}...` : data.smallDesc;

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
      <div className={styles.date}>{new Date(data.date).toLocaleDateString("fa")}</div>
      <div className={styles.location}>{data.location}</div>
      <p>{truncatedDescription}</p>
      <Link href={`projects/${data.slug}`}>مشاهده</Link>
    </div>
  );
};

export default ProjectsPage;
