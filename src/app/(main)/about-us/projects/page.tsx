import type { Metadata } from "next";

import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";
import { PublicImage } from "@/components/public/PublicImage";
import { PublicShell } from "@/components/public/PublicShell";
import { getProjects as getProjectsFromData, type ProjectListItem } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "گالری تصاویر پروژه ها | فرابک",
  description: "شما در این صفحه میتوانید اطلاعاتی درباره پروژه های شرکت فرابک مشاهده کنید.",
  robots: {
    index: true,
    follow: true,
  },
};

async function getProjects(): Promise<ProjectListItem[]> {
  try {
    return await getProjectsFromData();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

const formatDate = (date: string) => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? "تاریخ ثبت نشده"
    : parsedDate.toLocaleDateString("fa-IR");
};

const ProjectsPage = async () => {
  const projects = await getProjects();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["AboutPage", "CollectionPage"],
    name: "گالری تصاویر پروژه های فرابک",
    description:
      "مشاهده تصاویری از پروژه‌های انجام شده قبلی توسط تیم فرابک، به همراه توضیحات تکمیلی پروژه‌ها",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/projects`,
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
          image: project.mainImg
            ? `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${project.mainImg}`
            : undefined,
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
      <PublicShell as="main" className="py-10 sm:py-14 lg:py-16">
        <PublicBreadcrumbs
          breadcrumbs={["/", "/about-us", "/about-us/projects"]}
          labels={{ "/about-us/projects": "پروژه‌ها" }}
        />
        <PageIntro
          eyebrow="پرونده پروژه‌ها"
          title="پروژه‌ها، به‌عنوان سابقه منتشرشده"
          description="این صفحه مجموعه‌ای از پروژه‌هایی است که برای معرفی عمومی ثبت شده‌اند. هر رکورد، تاریخ، موقعیت و توضیح خودش را دارد؛ نمایش یک پروژه به‌تنهایی به معنی موجودی یا دسترسی فعلی نیست."
          actions={
            <ActionLink href="/contact-us" variant="primary">
              درباره پروژه شما گفت‌وگو کنیم
            </ActionLink>
          }
        />

        {projects.length > 0 ? (
          <section aria-labelledby="projects-list-title">
            <h2 id="projects-list-title" className="sr-only">
              فهرست پروژه‌های منتشرشده
            </h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_36px_rgba(6,26,48,0.06)]"
                >
                  <PublicImage
                    src={
                      project.mainImg
                        ? `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${project.mainImg}`
                        : null
                    }
                    alt={project.title}
                    fallbackLabel="تصویر این پروژه موجود نیست"
                    width={1000}
                    height={700}
                    className="aspect-10/7 h-auto w-full object-cover"
                    sizes="(min-width: 1024px) 31vw, (min-width: 768px) 47vw, 100vw"
                  />
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--farabak-ink-muted)">
                      <span>{formatDate(project.date)}</span>
                      <span aria-hidden="true" className="text-slate-300">
                        |
                      </span>
                      <span>{project.location || "موقعیت ثبت نشده"}</span>
                    </div>
                    <h3 className="mt-4 text-xl leading-9 font-bold text-(--farabak-ink-deep)">
                      {project.title}
                    </h3>
                    <p className="mt-3 line-clamp-4 leading-8 text-(--farabak-ink-muted)">
                      {project.smallDesc}
                    </p>
                    <ActionLink
                      href={`/about-us/projects/${project.slug}`}
                      variant="secondary"
                      className="mt-6 w-full"
                    >
                      مشاهده پرونده پروژه
                    </ActionLink>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <div
            role="status"
            className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"
          >
            <h2 className="text-xl font-bold text-(--farabak-ink-deep)">
              پروژه‌ای برای نمایش ثبت نشده است
            </h2>
            <p className="mt-3 leading-8 text-(--farabak-ink-muted)">
              برای بررسی راهکار مناسب، مسیر گفت‌وگو با تیم فرابک باز است.
            </p>
          </div>
        )}
      </PublicShell>
    </>
  );
};

export default ProjectsPage;
