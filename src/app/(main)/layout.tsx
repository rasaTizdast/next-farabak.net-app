import Header from "./_components/ui/header/Header";
import Footer from "./_components/ui/footer/Footer";
import BackToTop from "../_components/ui/BackToTop";
import Script from "next/script";
import { Metadata } from "next";

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
    </>
  );
};

export default Layout;
