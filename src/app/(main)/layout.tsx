import Header from "./_components/ui/header/Header";
import Footer from "./_components/ui/footer/Footer";
import BackToTop from "../_components/ui/BackToTop";
import Script from "next/script";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      {/* <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="b406fd7a-09ee-41dd-8d82-97c7184b61bf"
      /> */}
      <Header />
      {children}
      <Footer />
      {/* Include the client-side BackToTop component */}
      <BackToTop />
    </>
  );
};

export default Layout;
