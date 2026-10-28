import type { Members } from "@prisma/client";
import type { Metadata } from "next";

import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicImage } from "@/components/public/PublicImage";
import { PublicShell } from "@/components/public/PublicShell";
import { getMembers } from "@/lib/data/members";

export const metadata: Metadata = {
  title: "اعضای هیئت مدیره | فرابک",
  description: "مشاهده اعضای هیئت مدیره به‌همراه تجربیات و نقش های کلیدی هر یک از اعضای هیئت مدیره",
  robots: {
    index: true,
    follow: true,
  },
};

const fetchMembers = async (): Promise<Members[]> => {
  try {
    return await getMembers();
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
};

const MembersPage = async () => {
  const members = await fetchMembers();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["AboutPage", "ItemList"],
    name: "اعضای هیئت مدیره فرابک",
    description:
      "مشاهده اعضای هیئت مدیره به‌همراه تجربیات و نقش های کلیدی هر یک از اعضای هیئت مدیره",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/members`,
    numberOfItems: members.length,
    isPartOf: {
      "@type": "WebSite",
      url: process.env.NEXT_PUBLIC_BASE_URL,
    },
    mainEntity: {
      "@type": "Organization",
      "@id": "https://farabak.net",
      name: "فرابک",
      url: process.env.NEXT_PUBLIC_BASE_URL,
      member: members.map((member) => ({
        "@type": "Person",
        name: member.Name,
        jobTitle: member.Role,
        image: member.main_pic
          ? `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/member-images/${member.main_pic}`
          : undefined,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/members/${member.Slug}`,
        worksFor: {
          "@type": "Organization",
          name: "فرابک",
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
        <PageIntro
          eyebrow="آرشیو افراد"
          title="افرادی که پشت این مسیر ایستاده‌اند"
          description="معرفی اعضای هیئت‌مدیره و نقش ثبت‌شده آن‌ها در ساختار شرکت. برای هر نفر، تنها اطلاعاتی را می‌بینید که در صفحه معرفی منتشر شده است."
          actions={
            <ActionLink href="/about-us/activity" variant="secondary">
              حوزه‌های فعالیت
            </ActionLink>
          }
        />

        {members.length > 0 ? (
          <section aria-labelledby="members-list-title">
            <h2 id="members-list-title" className="sr-only">
              فهرست اعضای هیئت‌مدیره
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <article
                  key={member.Membersid}
                  className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_36px_rgba(6,26,48,0.06)]"
                >
                  <PublicImage
                    src={
                      member.main_pic
                        ? `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/member-images/${member.main_pic}`
                        : null
                    }
                    alt={member.Name}
                    fallbackLabel="تصویر این عضو موجود نیست"
                    width={600}
                    height={480}
                    className="aspect-5/4 h-auto w-full object-cover"
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 45vw, 100vw"
                  />
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className="text-sm font-semibold tracking-[0.08em] text-(--farabak-action-blue)">
                      عضو هیئت‌مدیره
                    </p>
                    <h3 className="mt-3 text-xl font-bold text-(--farabak-ink-deep)">
                      {member.Name}
                    </h3>
                    <p className="mt-2 leading-8 text-(--farabak-ink-muted)">{member.Role}</p>
                    <ActionLink
                      href={`/about-us/members/${member.Slug}`}
                      variant="secondary"
                      className="mt-6 w-full"
                    >
                      مشاهده معرفی
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
              فهرست اعضا در دسترس نیست
            </h2>
            <p className="mt-3 leading-8 text-(--farabak-ink-muted)">
              اطلاعات این آرشیو هنوز منتشر نشده است.
            </p>
          </div>
        )}
      </PublicShell>
    </>
  );
};

export default MembersPage;
