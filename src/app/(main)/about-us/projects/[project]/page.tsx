import { Metadata } from "next";
import { notFound } from "next/navigation";

import styles from "./ProjectPage.module.css";
import ProjectSlider from "./ProjectSlider";
import VideoPlayer from "@/app/_components/ui/VideoPlayer";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";

type ParamsType = {
  params: { project: string };
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
    const response = await fetch(
      `${process.env.BASE_URL}/api/projects/getProjectData/${slug}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch project data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching project data:", error);
    return null;
  }
}

export const generateMetadata = async ({
  params,
}: ParamsType): Promise<Metadata> => {
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

const ProjectPage = async ({ params }: ParamsType) => {
  const projectData = await getProjectData(params.project);

  if (!projectData) {
    notFound();
  }

  const { title, date, images, largeDesc, location, video }: ProjectProps =
    projectData;

  const breadcrumbs = ["/", "/about-us", "/about-us/projects"];
  return (
    <section className={styles.content}>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <h1>{title}</h1>
      <h3 aria-label="date of the project">
        {new Date(date).toLocaleDateString("fa")}
      </h3>
      <h4 aria-label="location of the project">{location}</h4>
      <p>{largeDesc}</p>

      <ProjectSlider slides={images} />

      {video && <VideoPlayer url={video} />}
    </section>
  );
};

export default ProjectPage;
