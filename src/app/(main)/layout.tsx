import Header from "./_components/ui/header/Header";
import Footer from "./_components/ui/footer/Footer";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default layout;
