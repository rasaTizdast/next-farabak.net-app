import { Metadata } from "next";
import { ErrorPage } from "@/components/ui/ErrorPage";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

const NotFound = () => {
  return (
    <ErrorPage
      statusCode={404}
      title="مقاله‌ای یافت نشد"
      message="متأسفیم، اما مقاله‌ای با این مشخصات در سایت موجود نیست."
    />
  );
};

export default NotFound;
