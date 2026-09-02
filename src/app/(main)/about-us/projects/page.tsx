import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import SourcesList from "@/components/SourcesList";
import { buildSourcesFor } from "@/helpers/sources";
import { getProjects as getProjectsFromData } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "گالری تصاویر پروژه ها | فرابک",
  description: "شما در این صفحه میتوانید اطلاعاتی درباره پروژه های شرکت فرابک مشاهده کنید.",
  robots: {
    index: true,
    follow: true,
  },
};

type ProjectData = {
  id: number;
  title: string;
  smallDesc: string;
  mainImg: string;
  date: string;
  location: string;
  slug: string;
};

async function getProjects(): Promise<ProjectData[]> {
  try {
    return await getProjectsFromData();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

const projectsBreadCrumbs = ["/", "/about-us", "/about-us/projects"];

const ProjectsPage = async () => {
  const projects = await getProjects();

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

  const projectsSourceText = projects
    .map((project) => `${project.title} ${project.smallDesc} ${project.location}`)
    .join(" ");

  const jsonLd = JSON.stringify(structuredData);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="w-full max-w-[1580px]">
        <Breadcrumb breadcrumbs={projectsBreadCrumbs} />
        <main className="flex flex-wrap items-center justify-center gap-8">
          {projects.length > 0 ? (
            projects.map((item) => <Card key={item.id} data={item} />)
          ) : (
            <div className="py-8 text-center text-red-500">
              <p>هیچ پروژه ای یافت نشد</p>
            </div>
          )}
        </main>
        <SourcesList sources={buildSourcesFor(projectsSourceText)} className="mt-10">
          <p className="mb-4 text-xs leading-6 text-gray-500">
            پروژه‌های نمایش‌داده‌شده با تجهیزات رسمی تولیدکنندگان معتبر جهانی مانند Reolink، Smiths
            Detection و CEIA اجرا شده‌اند. برای آشنایی بیشتر با این تجهیزات می‌توانید به وب‌سایت
            رسمی تولیدکنندگان و همچنین صفحات پشتیبانی و گارانتی فرابک مراجعه کنید.
          </p>
        </SourcesList>
      </div>
    </>
  );
};

type CardProps = {
  data: ProjectData;
};

const Card = ({ data }: CardProps) => {
  const truncatedDescription =
    data.smallDesc.length > 160 ? `${data.smallDesc.substring(0, 160)}...` : data.smallDesc;

  return (
    <div className="relative flex max-w-[300px] flex-col justify-between rounded-lg bg-white p-4 text-start shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <Image
        src={`${process.env.LIARA_BUCKET_URL}/${data.mainImg}`}
        alt={data.title}
        width={1000}
        height={700}
        quality={75}
        className="h-[200px] w-full rounded-lg object-cover"
      />
      <h2 className="mt-4 mb-2 text-[1.1rem]">{data.title}</h2>
      <div className="font-light">{new Date(data.date).toLocaleDateString("fa")}</div>
      <div className="font-light">{data.location}</div>
      <p className="mt-2">{truncatedDescription}</p>
      <Link
        href={`projects/${data.slug}`}
        className="relative mt-6 inline-block w-full overflow-hidden rounded-lg bg-[#1e90ff] px-8 py-2 text-center text-[0.9rem] text-white transition-[transform,color,box-shadow] duration-300 after:absolute after:inset-y-0 after:inset-s-[100%] after:inset-e-0 after:z-[-1] after:bg-[#0e6aff] after:transition-[inset-inline-start,inset-inline-end] after:duration-500 hover:scale-[1.03] hover:text-white hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)] hover:after:inset-s-0 hover:after:inset-e-0"
      >
        مشاهده
      </Link>
    </div>
  );
};

export default ProjectsPage;
