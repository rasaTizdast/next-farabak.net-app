import { SkeletonTheme } from "react-loading-skeleton";
import Header from "./_components/ui/header/Header";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SkeletonTheme baseColor="#dadada" highlightColor="#f0f0f0">
      <Header />
      {children}
    </SkeletonTheme>
  );
};

export default layout;
