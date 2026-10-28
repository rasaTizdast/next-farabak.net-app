import type { Metadata } from "next";
import { io } from "next/cache";
import { Suspense } from "react";

import { ContactInquiryForm } from "@/app/(main)/contact-us/_components/ContactInquiryForm";
import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicShell } from "@/components/public/PublicShell";
import { getContactInfo } from "@/lib/data/contactUs";

export const metadata: Metadata = {
  title: "تماس با فرابک | آدرس و پشتیبانی",
  description:
    "برای خرید محصولات امنیتی یا پیگیری سفارشات با فرابک تماس بگیرید. آدرس: سعادت آباد، میدان کتاب، خیابان عسگری گراوندی، نبش آسمان هشتم، پلاک 6، طبقه همکف. ساعات بازدید: ۱۱-۱۳ و ۱۴-۱۶. پیام به پشتیبانی ارسال کنید یا با شماره ۰۲۱-۷۷۵۰۰۰۰۸ تماس حاصل فرمایید.",
  robots: {
    index: true,
    follow: true,
  },
};

const ContactUsContent = async () => {
  await io();
  const { address, emails, phone_numbers: phoneNumbers } = await getContactInfo();

  if (!address && emails.length === 0 && phoneNumbers.length === 0) {
    return (
      <PublicShell as="main" className="py-10 sm:py-14 lg:py-16">
        <PageIntro
          eyebrow="ارتباط با فرابک"
          title="اطلاعات تماس موقتاً در دسترس نیست"
          description="اطلاعات تماس از منبع اصلی دریافت نشد. لطفاً کمی بعد دوباره تلاش کنید یا از مرکز پشتیبانی مسیر مناسب را پیدا کنید."
          actions={
            <ActionLink href="/support" variant="primary">
              رفتن به مرکز پشتیبانی
            </ActionLink>
          }
        />
        <div
          role="status"
          className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center leading-8 text-(--farabak-ink-muted)"
        >
          هیچ شماره، ایمیل یا نشانی قابل اتکایی برای نمایش دریافت نشد.
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
      <PublicShell as="main" className="py-10 sm:py-14 lg:py-16">
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

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] lg:items-start">
          <section
            aria-labelledby="contact-form-title"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-9"
          >
            <p className="mb-3 text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
              فرم شروع پروژه
            </p>
            <h2 id="contact-form-title" className="text-2xl font-bold text-(--farabak-ink-deep)">
              نیازتان را کوتاه و روشن بنویسید
            </h2>
            <p className="mt-3 mb-7 leading-8 text-(--farabak-ink-muted)">
              فیلدهای ستاره‌دار نداریم؛ فقط اطلاعاتی را وارد کنید که برای تماس بعدی لازم است.
            </p>
            <ContactInquiryForm recipient={emails[0]?.address} />
          </section>

          <aside className="space-y-5">
            <section
              aria-labelledby="contact-address-title"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] sm:p-7"
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

            <section
              aria-labelledby="contact-location-title"
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_36px_rgba(6,26,48,0.06)]"
            >
              <div
                role="img"
                aria-label="نقشه تعاملی موقعیت دفتر در دسترس نیست"
                className="flex min-h-48 items-center justify-center bg-[linear-gradient(135deg,#e6eef5_0%,#f8fafc_48%,#d9e6f0_100%)] p-8 text-center text-sm leading-7 text-(--farabak-ink-muted)"
              >
                نقشه تعاملی در این نسخه در دسترس نیست؛ نشانی ثبت‌شده را بررسی کنید.
              </div>
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
    <Suspense
      fallback={
        <PublicShell
          as="main"
          className="py-16"
          role="status"
          aria-label="در حال بارگذاری تماس با فرابک"
        >
          <PageIntro title="ارتباط با فرابک" description="اطلاعات تماس در حال بارگذاری است." />
        </PublicShell>
      }
    >
      <ContactUsContent />
    </Suspense>
  );
}
