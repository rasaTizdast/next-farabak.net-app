import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicImage } from "@/components/public/PublicImage";
import { PublicShell } from "@/components/public/PublicShell";
import { getMemberPage } from "@/lib/data/members";

type Props = {
  params: Promise<{
    member: string;
  }>;
};

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const memberData = await getMemberPage(params.member);

  if (!memberData) {
    return {
      title: "عضوی یافت نشد!",
      description: "عضوی یافت نشد، لطفا مجددا تلاش کنید!",
    };
  }

  return {
    title: `معرفی ${memberData.Name} | فرابک`,
    description: `مشاهده صفحه معرفی ${memberData.Name} که عضوی از هیئت مدیره شرکت فرابک هستند و سمت ${memberData.Role} را دارند.`,
    robots: {
      index: true,
      follow: true,
    },
  };
};

const MemberPage = async (props: Props) => {
  const params = await props.params;
  const memberData = await getMemberPage(params.member);

  if (!memberData) {
    notFound();
  }

  const {
    Name: name,
    Role: role,
    main_description: description,
    main_pic: image,
    phonenumber: phone,
  } = memberData;
  const memberUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/members/${params.member}`;
  const imageUrl = image
    ? `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/member-images/${image}`
    : null;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": memberUrl,
    name,
    jobTitle: role,
    description: description || undefined,
    image: imageUrl || undefined,
    url: memberUrl,
    worksFor: {
      "@id": "https://farabak.net",
    },
    affiliation: {
      "@id": "https://farabak.net",
    },
    areaServed: {
      "@type": "Country",
      name: "Iran",
    },
    knowsAbout: ["دوربین مداربسته", "ایکس‌ری", "فلزیاب", "نظارت تصویری"],
    contactPoint: phone
      ? {
          "@type": "ContactPoint",
          telephone: phone,
          contactType: "sales",
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PublicShell as="main" className="py-10 sm:py-14 lg:py-16">
        <PageIntro
          eyebrow="آرشیو اعضای هیئت‌مدیره"
          title={name}
          description={role}
          actions={
            <ActionLink href="/about-us/members" variant="secondary">
              بازگشت به فهرست اعضا
            </ActionLink>
          }
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <section
            aria-labelledby="member-bio-title"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-10"
          >
            <p className="mb-3 text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
              معرفی منتشرشده
            </p>
            <h2 id="member-bio-title" className="text-2xl font-bold text-(--farabak-ink-deep)">
              درباره {name}
            </h2>
            {description ? (
              <p className="mt-7 text-justify leading-[2.2] whitespace-pre-wrap text-(--farabak-ink-muted)">
                {description}
              </p>
            ) : (
              <p
                role="status"
                className="mt-7 rounded-2xl bg-slate-100 p-5 text-center leading-8 text-slate-600"
              >
                برای این عضو اطلاعات تکمیلی منتشر نشده است.
              </p>
            )}
          </section>

          <aside className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-7 lg:sticky lg:top-28">
            <PublicImage
              src={imageUrl}
              alt={name}
              fallbackLabel="تصویر این عضو موجود نیست"
              width={600}
              height={480}
              className="aspect-5/4 h-auto w-full rounded-2xl object-cover"
              sizes="(min-width: 1024px) 352px, 100vw"
            />
            {phone ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <a
                  href={`https://wa.me/${phone}`}
                  className="flex min-h-12 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-(--farabak-ink-deep) transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span>واتس‌اپ</span>
                  <FaWhatsapp aria-hidden="true" size={20} />
                </a>
                <a
                  href={`tel:${phone}`}
                  className="flex min-h-12 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-(--farabak-ink-deep) transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span>تماس مستقیم</span>
                  <FaPhoneAlt aria-hidden="true" size={18} />
                </a>
                <span className="sr-only">
                  شماره تماس: <bdi dir="ltr">{phone}</bdi>
                </span>
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-100 p-4 text-center text-sm leading-7 text-slate-600">
                راه ارتباطی مستقیمی برای این عضو ثبت نشده است.
              </p>
            )}
          </aside>
        </div>
      </PublicShell>
    </>
  );
};

export default MemberPage;
