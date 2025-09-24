import { Metadata } from "next";
import { notFound } from "next/navigation";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import VideoPlayer from "@/app/_components/ui/VideoPlayer";

import styles from "./ProjectPage.module.css";
import ProjectSlider from "./ProjectSlider";

type ParamsType = {
  params: Promise<{ project: string }>;
};

type ProjectProps = {
  id: number;
  title: string;
  date: string;
  images: { id: number; img: string; alt: string }[];
  largeDesc: string;
  location: string;
  video?: string;
};

// Fetch project data from the API
async function getProjectData(slug: string) {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/projects/getProjectData/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch project data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching project data:", error);
    return null;
  }
}

export const generateMetadata = async (props: ParamsType): Promise<Metadata> => {
  const params = await props.params;
  const projectData = await getProjectData(params.project);

  if (!projectData) {
    return {
      title: "پروژه‌ای یافت نشد!",
      description: "پروژه ای با این نام وجود ندارد!",
    };
  }

  return {
    title: `${projectData.title} | فرابک`,
    description: `مشاهده پروژه ${projectData.title} | فرابک`,
  };
};

const ProjectPage = async (props: ParamsType) => {
  const params = await props.params;
  const projectData = await getProjectData(params.project);

  if (!projectData) {
    notFound();
  }

  const { title, date, images, largeDesc, location, video }: ProjectProps = projectData;

  const breadcrumbs = ["/", "/about-us", "/about-us/projects"];

  // Prepare structured data for Schema.org
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: largeDesc,
    image: images.map((img) => `${process.env.LIARA_BUCKET_URL}/${img.img}`),
    datePublished: date,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/projects/${params.project}`,
    publisher: {
      "@type": "Organization",
      name: "فرابک",
      url: process.env.NEXT_PUBLIC_BASE_URL,
    },
    locationCreated: {
      "@type": "Place",
      name: location,
    },
    video: video
      ? {
          "@type": "VideoObject",
          url: video,
          name: `ویدیو پروژه ${title}`,
        }
      : undefined,
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
        {
          "@type": "ListItem",
          position: 4,
          name: title,
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/projects/${params.project}`,
        },
      ],
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className={styles.content}>
        <Breadcrumb breadcrumbs={breadcrumbs} />
        <h1>{title}</h1>
        <h3 aria-label="date of the project">{new Date(date).toLocaleDateString("fa")}</h3>
        <h4 aria-label="location of the project">{location}</h4>
        <p>{largeDesc}</p>

        <ProjectSlider slides={images} />

        {video && <VideoPlayer url={video} />}
      </section>
    </>
  );
};

export default ProjectPage;
