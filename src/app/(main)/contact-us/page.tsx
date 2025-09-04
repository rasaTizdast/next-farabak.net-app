export const dynamic = "force-dynamic";

import { Metadata } from "next";

import styles from "./ContactUsPage.module.css";

export const metadata: Metadata = {
  title: "تماس با ما | فرابک",
  description: "راه های تماس با شرکت فرابک را میتوانید از این صفحه مشاهده کنید.",
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

  return (
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
  );
};

export default ContactUsPage;
