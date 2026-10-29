import type { Metadata } from "next";
import { notFound } from "next/navigation";

import VideoPlayer from "@/app/_components/ui/VideoPlayer";
import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";
import { PublicShell } from "@/components/public/PublicShell";
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

const formatDate = (date: string) => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? "تاریخ ثبت نشده"
    : parsedDate.toLocaleDateString("fa-IR");
};

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
        image: images.map((image) => `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${image.img}`),
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
      },
      {
        "@type": "Organization",
        "@id": "https://farabak.net",
        name: "فرابک",
        url: process.env.NEXT_PUBLIC_BASE_URL,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PublicShell as="main" className="py-10 sm:py-14 lg:py-16">
        <PublicBreadcrumbs
          breadcrumbs={[
            "/",
            "/about-us",
            "/about-us/projects",
            `/about-us/projects/${params.project}`,
          ]}
          labels={{ [`/about-us/projects/${params.project}`]: title }}
        />
        <PageIntro
          eyebrow="پرونده پروژه"
          title={title}
          description="یک رکورد منتشرشده از آرشیو پروژه‌های فرابک؛ جزئیات این صفحه را به‌عنوان سابقه ثبت‌شده بخوانید، نه نشانه‌ای از دسترسی یا موجودی فعلی."
          actions={
            <>
              <ActionLink href="/about-us/projects" variant="secondary">
                بازگشت به پروژه‌ها
              </ActionLink>
              <ActionLink href="/contact-us" variant="primary">
                بررسی پروژه جدید
              </ActionLink>
            </>
          }
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <article className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-8 lg:p-10">
            <section aria-labelledby="project-description-title">
              <p className="mb-3 text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
                شرح منتشرشده
              </p>
              <h2
                id="project-description-title"
                className="text-2xl font-bold text-(--farabak-ink-deep)"
              >
                درباره این پروژه
              </h2>
              <p className="mt-6 text-justify leading-[2.1] whitespace-pre-wrap text-(--farabak-ink-muted)">
                {largeDesc}
              </p>
            </section>

            <figure className="mt-10 overflow-hidden rounded-3xl bg-slate-950 p-2 sm:p-3">
              <ProjectSlider slides={images} />
              <figcaption className="px-2 pt-4 pb-1 text-sm leading-7 text-slate-300">
                تصاویر ثبت‌شده در پرونده این پروژه
              </figcaption>
            </figure>

            {video ? <VideoPlayer url={video} /> : null}
          </article>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] lg:sticky lg:top-28">
            <h2 className="text-lg font-bold text-(--farabak-ink-deep)">جزئیات ثبت</h2>
            <dl className="mt-5 divide-y divide-slate-100">
              <div className="flex items-start justify-between gap-4 py-4 first:pt-0">
                <dt className="text-sm text-(--farabak-ink-muted)">تاریخ</dt>
                <dd className="text-left text-sm font-semibold text-(--farabak-ink-deep)" dir="ltr">
                  {formatDate(date)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-4 last:pb-0">
                <dt className="text-sm text-(--farabak-ink-muted)">موقعیت</dt>
                <dd className="text-left text-sm font-semibold text-(--farabak-ink-deep)">
                  {location || "ثبت نشده"}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </PublicShell>
    </>
  );
};

export default ProjectPage;
