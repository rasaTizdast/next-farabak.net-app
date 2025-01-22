export const dynamic = "force-dynamic"; // To ensure this page isn't statically generated

import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "صفحه‌ای یافت نشد",
  description: "صفحه ای برای این آدرس یافت نشد، مجددا تلاش کنید.",
  robots: {
    index: false, // This sets the noindex directive
    follow: false, // Allows crawling of links on the page if needed
  },
};

const TrainingSectionPage = () => {
  return notFound();
};

export default TrainingSectionPage;
