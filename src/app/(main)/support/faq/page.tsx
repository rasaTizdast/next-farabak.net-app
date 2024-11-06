import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "صفحه‌ای یافت نشد",
  description: "صفحه ای برای این آدرس یافت نشد، مجددا تلاش کنید.",
};

const FaqPage = () => {
  return notFound();
};

export default FaqPage;
