import type { Metadata } from "next";

import { PublicShell } from "@/components/public/PublicShell";
import { createRouteMetadata } from "@/lib/seo/route-metadata";

import BoardWorkspace from "./BoardWorkspace";

export const metadata: Metadata = {
  ...createRouteMetadata({
    title: "میز تصمیم محصولات | فرابک",
    description: "مقایسه گزینه‌های ذخیره‌شده در راهنمای انتخاب محصول فرابک.",
    path: "/product-finder/board",
  }),
  title: "میز تصمیم محصولات | فرابک",
  description: "مقایسه گزینه‌های ذخیره‌شده در راهنمای انتخاب محصول فرابک.",
  robots: { index: false, follow: true },
};

export default function ProductFinderBoardPage() {
  return (
    <PublicShell className="py-12">
      <BoardWorkspace />
    </PublicShell>
  );
}
