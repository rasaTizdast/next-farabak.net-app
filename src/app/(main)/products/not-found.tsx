import type { Metadata } from "next";

import { ActionLink } from "@/components/public/ActionLink";
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
      title="محصولی یافت نشد"
      message="این مدل یا صفحه دیگر در دسترس نیست. از کاتالوگ محصولات شروع کنید یا برای راهنمایی با ما تماس بگیرید."
    >
      <div className="flex flex-wrap justify-center gap-3">
        <ActionLink href="/products">بازگشت به کاتالوگ</ActionLink>
        <ActionLink href="/contact-us" variant="secondary">
          ارتباط با کارشناسان
        </ActionLink>
      </div>
    </ErrorPage>
  );
};

export default NotFound;
