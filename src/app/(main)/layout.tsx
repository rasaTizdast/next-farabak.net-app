import { SkeletonTheme } from "react-loading-skeleton";
import Header from "./_components/ui/header/Header";
import Footer from "./_components/ui/footer/Footer";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SkeletonTheme baseColor="#dadada" highlightColor="#f0f0f0">
      <Header />
      {children}
      <Footer />
    </SkeletonTheme>
  );
};

export default layout;
