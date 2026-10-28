import type { Metadata } from "next";

import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicImage } from "@/components/public/PublicImage";
import { PublicShell } from "@/components/public/PublicShell";
import { getActivities } from "@/lib/data/activities";

export const metadata: Metadata = {
  title: "فعالیت های شرکت فرابک | فرابک",
  description: "شما در این صفحه میتوانید اطلاعاتی درباره فعالیت های شرکت فرابک مشاهده کنید.",
  robots: {
    index: true,
    follow: true,
  },
};

type DetailsActivity = {
  id: number;
  activityID: number;
  description: string;
};

type MasterActivity = {
  id: number;
  title: string;
  Details_activity: DetailsActivity[];
};

const ActivityPage = async () => {
  const activities: MasterActivity[] = await getActivities();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["AboutPage", "ItemList"],
    name: "فعالیت های شرکت فرابک",
    description: "اطلاعات درباره فعالیت ها، خدمات و تخصص های شرکت فرابک",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/activity`,
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
          name: "فعالیت های شرکت",
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/activity`,
        },
      ],
    },
    isPartOf: {
      "@type": "WebSite",
      url: process.env.NEXT_PUBLIC_BASE_URL,
    },
    mainEntity: {
      "@type": "Organization",
      name: "فرابک",
      url: process.env.NEXT_PUBLIC_BASE_URL,
      department: activities.map((activity) => ({
        "@type": "OrganizationRole",
        name: activity.title,
        description: activity.Details_activity.map((detail) => detail.description).join(" | "),
        roleName: "Service Provider",
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
        <PageIntro
          eyebrow="پرونده فعالیت"
          title="حوزه‌های کاری فرابک"
          description="این صفحه فهرستی از فعالیت‌ها و تخصص‌هایی است که در داده‌های شرکت ثبت شده‌اند؛ برای هر حوزه، جزئیات منتشرشده را دقیق و بدون ادعای اضافه می‌خوانید."
          actions={
            <>
              <ActionLink href="/about-us/projects" variant="secondary">
                مشاهده پروژه‌ها
              </ActionLink>
              <ActionLink href="/contact-us" variant="primary">
                گفت‌وگو درباره پروژه
              </ActionLink>
            </>
          }
        />

        {activities.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {activities.map((activity) => (
              <section
                key={activity.id}
                aria-labelledby={`activity-${activity.id}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-8"
              >
                <p className="mb-3 text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
                  حوزه ثبت‌شده
                </p>
                <h2
                  id={`activity-${activity.id}`}
                  className="text-xl leading-9 font-bold text-(--farabak-ink-deep)"
                >
                  {activity.title}
                </h2>
                <ul className="list-square mt-5 space-y-3 pe-5 leading-8 text-(--farabak-ink-muted)">
                  {activity.Details_activity.map((detail) => (
                    <li key={detail.id}>{detail.description}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div
            role="status"
            className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"
          >
            <h2 className="text-xl font-bold text-(--farabak-ink-deep)">
              اطلاعات فعالیت‌ها در دسترس نیست
            </h2>
            <p className="mt-3 leading-8 text-(--farabak-ink-muted)">
              برای دریافت اطلاعات دقیق‌تر با تیم فرابک در ارتباط باشید.
            </p>
          </div>
        )}

        <section
          aria-labelledby="company-certificates-title"
          className="mt-16 border-t border-slate-200 pt-10 sm:mt-20 sm:pt-14"
        >
          <div className="mb-6 max-w-2xl sm:mb-8">
            <p className="mb-3 text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
              اسناد شرکت
            </p>
            <h2
              id="company-certificates-title"
              className="text-2xl font-bold text-(--farabak-ink-deep) sm:text-3xl"
            >
              گواهی‌نامه‌ها و افتخارات
            </h2>
            <p className="mt-3 leading-8 text-(--farabak-ink-muted)">
              گزیده‌ای از گواهی‌نامه‌ها و اسناد ثبت‌شده شرکت فرابک.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:items-start">
            <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_16px_36px_rgba(6,26,48,0.08)] sm:p-3">
              <PublicImage
                src="/about-us/certificates/company-certificates.jpeg"
                alt="مجموعه گواهی‌نامه‌ها و افتخارات شرکت فرابک"
                fallbackLabel="تصویر گواهی‌نامه‌ها موجود نیست"
                width={1306}
                height={819}
                className="h-auto w-full rounded-2xl"
                sizes="(min-width: 1024px) 64vw, 100vw"
              />
              <figcaption className="px-2 pt-4 pb-1 text-sm font-medium text-(--farabak-ink-muted)">
                مجموعه‌ای از گواهی‌نامه‌ها و تقدیرنامه‌های شرکت
              </figcaption>
            </figure>
            <figure className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_16px_36px_rgba(6,26,48,0.08)] sm:p-3 lg:max-w-none">
              <PublicImage
                src="/about-us/certificates/quality-registration-certificate.jpeg"
                alt="گواهی ثبت کیفیت شرکت فرابهکاران تصویر هفتم (فرابک)"
                fallbackLabel="تصویر گواهی ثبت کیفیت موجود نیست"
                width={900}
                height={1200}
                className="h-auto w-full rounded-2xl"
                sizes="(min-width: 1024px) 31vw, (min-width: 640px) 448px, 100vw"
              />
              <figcaption className="px-2 pt-4 pb-1 text-sm font-medium text-(--farabak-ink-muted)">
                گواهی ثبت کیفیت — سند آرشیوی
              </figcaption>
            </figure>
          </div>
        </section>
      </PublicShell>
    </>
  );
};

export default ActivityPage;
