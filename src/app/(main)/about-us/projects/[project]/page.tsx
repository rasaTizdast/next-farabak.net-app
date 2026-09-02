import { Metadata } from "next";
import { notFound } from "next/navigation";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import VideoPlayer from "@/app/_components/ui/VideoPlayer";
import { getProjectData as getProjectDataFromDataLayer } from "@/lib/data/projects";

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

async function getProjectData(slug: string) {
  try {
    return await getProjectDataFromDataLayer(slug);
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

const projectBreadcrumbs = ["/", "/about-us", "/about-us/projects"];

const ProjectPage = async (props: ParamsType) => {
  const params = await props.params;
  const projectData = await getProjectData(params.project);

  if (!projectData) {
    notFound();
  }

  const { title, date, images, largeDesc, location, video }: ProjectProps = projectData;

  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/projects/${params.project}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Article", "CreativeWork"],
        "@id": `${pageUrl}#article`,
        headline: title,
        description: largeDesc,
        keywords: [
          title,
          location,
          "دوربین مداربسته",
          "نظارت تصویری",
          "پروژه",
          "سیستم امنیتی",
        ].filter(Boolean),
        image: images.map((img) => `${process.env.LIARA_BUCKET_URL}/${img.img}`),
        datePublished: date,
        dateModified: date,
        inLanguage: "fa-IR",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": pageUrl,
        },
        url: pageUrl,
        author: {
          "@id": "https://farabak.net",
        },
        publisher: {
          "@id": "https://farabak.net",
        },
        about: {
          "@id": "https://farabak.net",
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
              item: pageUrl,
            },
          ],
        },
      },
      {
        "@type": "Organization",
        "@id": "https://farabak.net",
        name: "فرابک",
        url: process.env.NEXT_PUBLIC_BASE_URL,
      },
    ],
  };
  const jsonLd = JSON.stringify(structuredData);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section className="w-full max-w-[1580px]">
        <Breadcrumb breadcrumbs={projectBreadcrumbs} />
        <h1 className="mt-8 text-[1.5rem] font-bold">{title}</h1>
        <h3 className="mt-5 mb-2 font-light" aria-label="date of the project">
          {new Date(date).toLocaleDateString("fa")}
        </h3>
        <h4 className="mb-1 font-light">{location}</h4>
        <p className="my-8 text-[1.1rem] leading-[1.7]">{largeDesc}</p>

        <div className="mx-auto mb-10 max-h-[300px] w-full max-w-[1580px] overflow-hidden rounded-xl md:max-h-[800px]">
          <ProjectSlider slides={images} />
        </div>

        {video && <VideoPlayer url={video} />}
      </section>
    </>
  );
};

export default ProjectPage;
