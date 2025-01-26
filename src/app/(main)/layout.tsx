import Header from "./_components/ui/header/Header";
import Footer from "./_components/ui/footer/Footer";
import BackToTop from "../_components/ui/BackToTop";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  other: {
    "google-site-verification": "ibG0VNoO2gB5dXMyvVgMR43MYU_D1jiM_fdtv3387ks",
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
        data-website-id="cbecfb4d-6b80-48d2-abac-13f7d8806239"
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
