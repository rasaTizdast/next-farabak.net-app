import { Metadata } from "next";
import Script from "next/script";

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
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
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
