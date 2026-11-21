import { Metadata } from "next";

import DashboardLayoutContent from "./DashboardLayoutContent";

export const metadata: Metadata = {
  title: {
    default: "حساب کاربری | فرابک",
    template: "%s | فرابک",
  },
  robots: {
    index: false, // This sets the noindex directive
    follow: true, // Allows crawling of links on the page if needed
  },
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </>
  );
};

export default DashboardLayout;
