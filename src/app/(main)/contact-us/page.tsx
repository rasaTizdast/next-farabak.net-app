import type { Metadata } from "next";
import { io } from "next/cache";
import { Suspense } from "react";

import { ContactInquiryForm } from "@/app/(main)/contact-us/_components/ContactInquiryForm";
import { ContactUsContentSkeleton } from "@/app/(main)/contact-us/ContactUsLoading";
import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";
import { PublicShell } from "@/components/public/PublicShell";
import { getContactInfo } from "@/lib/data/contactUs";
import { createRouteMetadata } from "@/lib/seo/route-metadata";

export const metadata: Metadata = {
  ...createRouteMetadata({
    title: "تماس با فرابک | آدرس و پشتیبانی",
    description:
      "برای خرید محصولات امنیتی یا پیگیری سفارشات با فرابک تماس بگیرید. آدرس: سعادت آباد، میدان کتاب، خیابان عسگری گراوندی، نبش آسمان هشتم، پلاک 6، طبقه همکف. ساعات بازدید: ۱۱-۱۳ و ۱۴-۱۶. پیام به پشتیبانی ارسال کنید یا با شماره ۰۲۱-۷۷۵۰۰۰۰۸ تماس حاصل فرمایید.",
    path: "/contact-us",
  }),
  title: "تماس با فرابک | آدرس و پشتیبانی",
  description:
    "برای خرید محصولات امنیتی یا پیگیری سفارشات با فرابک تماس بگیرید. آدرس: سعادت آباد، میدان کتاب، خیابان عسگری گراوندی، نبش آسمان هشتم، پلاک 6، طبقه همکف. ساعات بازدید: ۱۱-۱۳ و ۱۴-۱۶. پیام به پشتیبانی ارسال کنید یا با شماره ۰۲۱-۷۷۵۰۰۰۰۸ تماس حاصل فرمایید.",
  robots: {
    index: true,
    follow: true,
  },
};

export const ContactUsContent = async () => {
  await io();
  const { address, emails, phone_numbers: phoneNumbers } = await getContactInfo();
  const officeMapUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1360.8932132644327!2d51.35469992463351!3d35.78108017399431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e07b684c2b9d5%3A0x703fbc3293eb71d6!2sFARABAK%20Head%20Office%20Company!5e0!3m2!1sen!2s!4v1711904970824!5m2!1sen!2s";

  if (!address && emails.length === 0 && phoneNumbers.length === 0) {
    return (
      <PublicShell as="section" className="pb-12 sm:pb-14">
        <div
          role="status"
          className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center leading-8 text-(--farabak-ink-muted)"
        >
          اطلاعات تماس موقتاً در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید یا از
          <ActionLink href="/support" variant="quiet">
            مرکز پشتیبانی
          </ActionLink>
          کمک بگیرید.
        </div>
      </PublicShell>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "تماس با فرابک | آدرس و پشتیبانی",
    description: "راه های تماس با شرکت فرابک",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/contact-us`,
    mainEntity: {
      "@type": "Organization",
      name: "فرابک",
      url: process.env.NEXT_PUBLIC_BASE_URL,
      address: address
        ? {
            "@type": "PostalAddress",
            streetAddress: address.address,
            postalCode: address.postal_code,
            addressCountry: "IR",
          }
        : undefined,
      email: emails.map((email) => email.address),
      telephone: phoneNumbers.map((phone) => phone.number),
      contactPoint: emails.map((email) => ({
        "@type": "ContactPoint",
        email: email.address,
        contactType: email.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PublicShell as="section" className="pb-12 sm:pb-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(20rem,1.15fr)] lg:items-start">
          <div className="space-y-8">
            <section
              aria-labelledby="contact-inquiry-title"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-8"
            >
              <p className="mb-3 text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
                درخواست مشاوره
              </p>
              <h2
                id="contact-inquiry-title"
                className="text-xl font-bold text-(--farabak-ink-deep)"
              >
                نیاز پروژه‌تان را بنویسید
              </h2>
              <p className="mt-2 mb-5 leading-8 text-(--farabak-ink-muted)">
                پس از آماده‌سازی، پیام در برنامه ایمیل شما باز می‌شود تا آن را بررسی و ارسال کنید.
              </p>
              <ContactInquiryForm recipient={emails[0]?.address || undefined} />
            </section>

            <section
              aria-labelledby="contact-address-title"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-8"
            >
              <p className="mb-3 text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
                اطلاعات ثبت‌شده
              </p>
              <h2
                id="contact-address-title"
                className="text-xl font-bold text-(--farabak-ink-deep)"
              >
                راه‌های تماس
              </h2>
              <dl className="mt-5 space-y-5 leading-8">
                {address ? (
                  <div>
                    <dt className="text-sm text-(--farabak-ink-muted)">نشانی</dt>
                    <dd className="mt-1 font-semibold text-(--farabak-ink-deep)">
                      {address.address}
                    </dd>
                    {address.postal_code ? (
                      <dd className="mt-1 text-sm text-(--farabak-ink-muted)">
                        کدپستی: <bdi dir="ltr">{address.postal_code}</bdi>
                      </dd>
                    ) : null}
                  </div>
                ) : null}
                {phoneNumbers.length > 0 ? (
                  <div>
                    <dt className="text-sm text-(--farabak-ink-muted)">شماره‌های تماس</dt>
                    <dd className="mt-1 flex flex-col gap-1">
                      {phoneNumbers.map((phone) => (
                        <a
                          key={phone.id}
                          href={`tel:${phone.number}`}
                          className="font-semibold text-(--farabak-ink-deep) underline-offset-4 hover:text-(--farabak-action-blue) hover:underline focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none"
                        >
                          <bdi dir="ltr">{phone.number}</bdi>
                        </a>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {emails.length > 0 ? (
                  <div>
                    <dt className="text-sm text-(--farabak-ink-muted)">آدرس‌های ایمیل</dt>
                    <dd className="mt-1 flex flex-col gap-1">
                      {emails.map((email) => (
                        <a
                          key={email.id}
                          href={`mailto:${email.address}`}
                          className="font-semibold text-(--farabak-ink-deep) underline-offset-4 hover:text-(--farabak-action-blue) hover:underline focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none"
                        >
                          <span>{email.title}: </span>
                          <bdi dir="ltr">{email.address}</bdi>
                        </a>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          </div>

          <aside>
            <section
              aria-labelledby="contact-location-title"
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_36px_rgba(6,26,48,0.06)]"
            >
              <iframe
                title="نقشه تعاملی موقعیت دفتر مرکزی فرابک"
                src={officeMapUrl}
                sandbox="allow-scripts allow-same-origin allow-popups"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0 sm:h-96"
              />
              <div className="p-6 sm:p-7">
                <h2
                  id="contact-location-title"
                  className="text-lg font-bold text-(--farabak-ink-deep)"
                >
                  قبل از مراجعه هماهنگ کنید
                </h2>
                <p className="mt-2 leading-8 text-(--farabak-ink-muted)">
                  {address?.alt_text || "برای زمان بازدید و جزئیات مسیر با تیم فرابک تماس بگیرید."}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </PublicShell>
    </>
  );
};

export default function ContactUsPage() {
  return (
    <div>
      <PublicShell className="pt-6 sm:pt-8">
        <PublicBreadcrumbs
          breadcrumbs={["/", "/contact-us"]}
          labels={{ "/contact-us": "تماس با ما" }}
        />
        <PageIntro
          eyebrow="تماس و شروع گفت‌وگو"
          title="برای پروژه‌تان از یک گفت‌وگوی دقیق شروع کنید"
          description="اگر هنوز مدل یا مشخصات فنی را نمی‌دانید، مسئله، محل استفاده و محدودیت‌های پروژه را بنویسید. پیام شما در برنامه ایمیل‌تان آماده می‌شود تا آن را بررسی و ارسال کنید."
          actions={
            <ActionLink href="/privacy" variant="quiet">
              مطالعه سیاست حریم خصوصی
            </ActionLink>
          }
        />
      </PublicShell>
      <Suspense fallback={<ContactUsContentSkeleton />}>
        <ContactUsContent />
      </Suspense>
    </div>
  );
}
