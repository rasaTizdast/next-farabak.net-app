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
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id={process.env.UMAMI_WEBSITE_ID}
      ></Script>
      <Header />
      {children}
      <Footer />
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
