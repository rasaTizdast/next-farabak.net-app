import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";

import BackToTop from "../_components/ui/BackToTop";
import Footer from "./_components/ui/footer/Footer";
import Header from "./_components/ui/header/Header";
import WhatsAppContactButton from "./_components/ui/WhatsAppContactButton";

export const metadata: Metadata = {
  other: {
    "google-site-verification": `${process.env.GOOGLE_SITE_VERIFICATION}`,
  },
};

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Script
        src="https://cloud.umami.is/script.js"
        data-website-id={process.env.UMAMI_WEBSITE_ID}
        strategy="lazyOnload"
      />
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Suspense
          fallback={
            <header className="flex h-20 items-center justify-between bg-[#000814] px-6 text-white md:px-12">
              <Link className="font-bold" href="/">
                فرابک
              </Link>
              <nav className="flex gap-5 text-sm" aria-label="صفحات اصلی">
                <Link href="/products">محصولات</Link>
                <Link href="/contact-us">ارتباط با ما</Link>
              </nav>
            </header>
          }
        >
          <Header />
        </Suspense>
        <main style={{ flex: 1 }}>{children}</main>
        <Suspense
          fallback={
            <footer className="bg-[#000814] px-6 py-8 text-center text-sm text-[#cecece]">
              <span>فرابک</span>
              <a className="mr-4 underline" href="/contact-us">
                ارتباط با ما
              </a>
            </footer>
          }
        >
          <Footer />
        </Suspense>
      </div>
      {/* Include the client-side BackToTop component */}
      <BackToTop />
      <WhatsAppContactButton
        phoneNumber={process.env.NEXT_PUBLIC_SUPPORT_NUMBER!}
        initialMessage="سلام وقت بخیر، من سوالی درباره ..."
      />
    </>
  );
};

export default Layout;
