export const dynamic = "force-dynamic";

import { Metadata } from "next";

import styles from "./ContactUsPage.module.css";

export const metadata: Metadata = {
  title: "تماس با فرابک | آدرس و پشتیبانی",
  description:
    "برای خرید محصولات امنیتی یا پیگیری سفارشات با فرابک تماس بگیرید. آدرس: سعادت آباد، میدان کتاب، خیابان عسگری گراوندی، نبش آسمان هشتم، پلاک 6، طبقه همکف. ساعات بازدید: ۱۱-۱۳ و ۱۴-۱۶. پیام به پشتیبانی ارسال کنید یا با شماره ۰۲۱-۷۷۵۰۰۰۰۸ تماس حاصل فرمایید.",
  robots: {
    index: true, // This sets the noindex directive
    follow: true, // Allows crawling of links on the page if needed
  },
};

const ContactUsPage = async () => {
  // Fetch data from the API
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contact-us`, {
    cache: "no-store", // Ensure the data is always fresh
  });

  if (!response.ok) {
    throw new Error("خطایی در دریافت اطلاعات رخ داد.");
  }

  const data = await response.json();

  const { address, emails, phone_numbers } = data;

  // Prepare structured data for Schema.org
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
      email: emails.map((email) => email.address),
      telephone: phone_numbers.map((phone) => phone.number),
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
      <main className={styles.main}>
        <div className={styles.section}>
          <h1>آدرس</h1>
          <div className={styles.para}>
            <div className={styles.bold}>آدرس: </div>
            {address?.address}
          </div>
          <div className={styles.para}>
            <div className={styles.bold}>کدپستی: </div>
            {address?.postal_code}
          </div>
          <p>{address?.alt_text}</p>
        </div>
        <div className={styles.section}>
          <h1>شماره‌های تماس</h1>
          <ul>
            {phone_numbers.map((phone: { id: number; number: string }) => (
              <li key={phone.id}>
                <a href={`tel:${phone.number}`}>{phone.number}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.section}>
          <h1>آدرس‌های ایمیل</h1>
          <ul>
            {emails.map((email: { id: number; title: string; address: string }) => (
              <li key={email.id}>
                <a href={`mailto:${email.address}`}>
                  <div className={styles.bold}>{email.title}:</div>
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
