import { Metadata } from "next";

import { PublicShell } from "@/components/public/PublicShell";
import { ErrorPage } from "@/components/ui/ErrorPage";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

const NotFound = () => {
  return (
    <PublicShell as="main" className="py-16">
      <ErrorPage
        statusCode={404}
        title="مقاله‌ای یافت نشد"
        message="متأسفیم، اما مقاله‌ای با این مشخصات در سایت موجود نیست."
      />
    </PublicShell>
  );
};

export default NotFound;
