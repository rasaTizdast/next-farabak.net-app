import { Metadata } from "next";

import { getContactInfo } from "@/lib/data/contactUs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "تماس با فرابک | آدرس و پشتیبانی",
  description:
    "برای خرید محصولات امنیتی یا پیگیری سفارشات با فرابک تماس بگیرید. آدرس: سعادت آباد، میدان کتاب، خیابان عسگری گراوندی، نبش آسمان هشتم، پلاک 6، طبقه همکف. ساعات بازدید: ۱۱-۱۳ و ۱۴-۱۶. پیام به پشتیبانی ارسال کنید یا با شماره ۰۲۱-۷۷۵۰۰۰۰۸ تماس حاصل فرمایید.",
  robots: {
    index: true,
    follow: true,
  },
};

const ContactUsPage = async () => {
  const { address, emails, phone_numbers } = await getContactInfo();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "تماس با فرابک | آدرس و پشتیبانی",
    description: "راه های تماس با شرکت فرابک",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/contact-us`,
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
          name: "تماس با ما",
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/contact-us`,
        },
      ],
    },
    mainEntity: {
      "@type": "Organization",
      name: "فرابک",
      url: process.env.NEXT_PUBLIC_BASE_URL,
      address: {
        "@type": "PostalAddress",
        streetAddress: address?.address,
        postalCode: address?.postal_code,
        addressCountry: "IR",
      },
      email: emails.map((email: { id: number; title: string; address: string }) => email.address),
      telephone: phone_numbers.map((phone: { id: number; number: string }) => phone.number),
      contactPoint: emails.map((email: { id: number; title: string; address: string }) => ({
        "@type": "ContactPoint",
        email: email.address,
        contactType: email.title,
      })),
    },
  };

  const jsonLd = JSON.stringify(structuredData);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <main
        className={cn(
          "my-4 flex w-full flex-col flex-wrap items-stretch gap-8 px-6 py-8 min-[992px]:px-16 min-[1200px]:px-24 md:my-8 md:flex-row md:px-12 2xl:px-40"
        )}
      >
        <div
          className={cn(
            "flex w-full flex-1 flex-col gap-4 rounded-lg bg-white p-8 shadow-[0px_8px_20px_rgba(0,0,0,0.1)] md:w-auto md:flex-[30%_1_1] md:p-[2rem_3rem]"
          )}
        >
          <h1 className="text-third mb-0 self-center text-[calc(0.7rem+0.5vw)] font-extrabold md:text-[calc(1rem+0.5vw)]">
            آدرس
          </h1>
          <div className="text-justify leading-loose font-extrabold">
            <div className="inline">آدرس: </div>
            {address?.address}
          </div>
          <div className="text-justify leading-loose font-extrabold">
            <div className="inline">کدپستی: </div>
            {address?.postal_code}
          </div>
          <p>{address?.alt_text}</p>
        </div>
        <div
          className={cn(
            "flex w-full flex-1 flex-col gap-4 rounded-lg bg-white p-8 shadow-[0px_8px_20px_rgba(0,0,0,0.1)] md:w-auto md:flex-[30%_1_1] md:p-[2rem_3rem]"
          )}
        >
          <h1 className="text-third mb-0 self-center text-[calc(0.7rem+0.5vw)] font-extrabold md:self-start md:text-[calc(1rem+0.5vw)]">
            شماره‌های تماس
          </h1>
          <ul className="list-square flex h-full flex-col justify-evenly gap-4">
            {phone_numbers.map((phone: { id: number; number: string }) => (
              <li key={phone.id}>
                <a
                  href={`tel:${phone.number}`}
                  className={cn("flex justify-between gap-4 text-(--color-dark-blue)")}
                >
                  {phone.number}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div
          className={cn(
            "flex w-full flex-1 flex-col gap-4 rounded-lg bg-white p-8 shadow-[0px_8px_20px_rgba(0,0,0,0.1)] md:w-auto md:flex-[30%_1_1] md:p-[2rem_3rem]"
          )}
        >
          <h1 className="text-third mb-0 self-center text-[calc(0.7rem+0.5vw)] font-extrabold md:self-start md:text-[calc(1rem+0.5vw)]">
            آدرس‌های ایمیل
          </h1>
          <ul className="list-square flex h-full flex-col items-center justify-evenly gap-4">
            {emails.map((email: { id: number; title: string; address: string }) => (
              <li key={email.id}>
                <a
                  href={`mailto:${email.address}`}
                  className={cn("flex justify-between gap-4 text-(--color-dark-blue)")}
                >
                  <div className="inline font-extrabold">{email.title}:</div>
                  <span>{email.address}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
};

export default ContactUsPage;
