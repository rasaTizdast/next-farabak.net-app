// app/auth/layout.tsx

import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
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
      <div className="animate-gradient flex min-h-screen items-center justify-center bg-gradient-to-r from-[#00bfff] via-[#1e90ff] via-[#318ce7] to-[#0e6aff] bg-[length:400%]">
        {children}
      </div>
    </>
  );
}
