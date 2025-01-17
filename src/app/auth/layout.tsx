// app/auth/layout.tsx

import { Metadata } from "next";
import styles from "./AuthLayout.module.css";
import Script from "next/script";

export const metadata: Metadata = {
  robots: {
    index: false, // This sets the noindex directive
    follow: false, // Allows crawling of links on the page if needed
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="b406fd7a-09ee-41dd-8d82-97c7184b61bf"
      /> */}
      <div className={styles.parent}>{children}</div>
    </>
  );
}
