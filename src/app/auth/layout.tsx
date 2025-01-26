// app/auth/layout.tsx

import { Metadata } from "next";
import styles from "./AuthLayout.module.css";
import Script from "next/script";

export const metadata: Metadata = {
  robots: {
    index: false, // This sets the noindex directive
    follow: false, // Allows crawling of links on the page if needed
  },
  other: {
    "google-site-verification": "ibG0VNoO2gB5dXMyvVgMR43MYU_D1jiM_fdtv3387ks",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="cbecfb4d-6b80-48d2-abac-13f7d8806239"
      ></Script>
      <div className={styles.parent}>{children}</div>
    </>
  );
}
