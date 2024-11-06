import { Metadata } from "next";
import { notFound } from "next/navigation";

import projects from "@/constants/projects.json";

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
  images: string[];
  largeDesc: string;
  location: string;
  video?: string;
};

export const generateMetadata = ({ params }: ParamsType): Metadata => {
  const projectData = projects.find(
    (project) => project.slug === params.project
  );

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

const ProjectPage = ({ params }: ParamsType) => {
  const projectData = projects.find(
    (project) => project.slug === params.project
  );

  if (!projectData) {
    notFound();
  }

  console.log(projectData);

  const { title, date, images, largeDesc, location, video }: ProjectProps =
    projectData;

  const breadcrumbs = [
    { path: "/", href: "/" },
    { path: "/about-us", href: "/about-us" },
    { path: "/about-us/projects", href: "/about-us/projects" },
  ];
  return (
    <section className={styles.content}>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <h1>{title}</h1>
      <h3 aria-label="date of the project">{date}</h3>
      <h4 aria-label="location of the project">{location}</h4>
      <p>{largeDesc}</p>

      <ProjectSlider slides={images} />

      {video && <VideoPlayer url={video} />}
    </section>
  );
};

export default ProjectPage;
