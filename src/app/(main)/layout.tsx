import Header from "./_components/ui/header/Header";
import Footer from "./_components/ui/footer/Footer";
import BackToTop from "../_components/ui/BackToTop";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
      {/* Include the client-side BackToTop component */}
      <BackToTop />
    </>
  );
};

export default Layout;
