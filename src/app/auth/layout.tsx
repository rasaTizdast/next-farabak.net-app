// app/auth/layout.tsx

import { Metadata } from "next";
import Script from "next/script";

import styles from "./AuthLayout.module.css";

export const metadata: Metadata = {
  robots: {
    index: true, // This sets the noindex directive
    follow: true, // Allows crawling of links on the page if needed
  },
  other: {
    "google-site-verification": `${process.env.GOOGLE_SITE_VERIFICATION}`,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id={process.env.UMAMI_WEBSITE_ID}
      ></Script>
      <div className={styles.parent}>{children}</div>
    </>
  );
}
