import { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";

import Link from "@/components/NoPrefetchLink";
import { PublicShell } from "@/components/public/PublicShell";

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
      <a
        href="#main-content"
        className="fixed top-2 right-2 z-100 -translate-y-24 bg-(--farabak-action-blue) px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        پرش به محتوای اصلی
      </a>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Suspense
          fallback={
            <header className="min-h-20 bg-(--farabak-mega-menu-bg) text-white">
              <PublicShell className="flex min-h-20 items-center justify-between gap-5">
                <Link className="font-bold" href="/">
                  فرابک
                </Link>
                <nav className="flex gap-5 text-sm" aria-label="صفحات اصلی">
                  <Link href="/products">محصولات</Link>
                  <Link href="/contact-us">ارتباط با ما</Link>
                </nav>
              </PublicShell>
            </header>
          }
        >
          <Header />
        </Suspense>
        <main id="main-content" style={{ flex: 1 }}>
          {children}
        </main>
        <Suspense
          fallback={
            <footer className="bg-linear-to-b from-(--farabak-mega-menu-bg) to-(--farabak-footer-bg) py-8 text-center text-sm text-[#cecece]">
              <PublicShell>
                <span>فرابک</span>
                <a className="mr-4 underline" href="/contact-us">
                  ارتباط با ما
                </a>
              </PublicShell>
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
