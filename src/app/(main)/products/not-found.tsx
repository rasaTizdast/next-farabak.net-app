import type { Metadata } from "next";
import { ErrorPage } from "@/components/ui/ErrorPage";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

const NotFound = () => {
  return <ErrorPage statusCode={404} title="محصولی یافت نشد" message="محصولی که به دنبال آن هستید وجود ندارد." />;
};

export default NotFound;
