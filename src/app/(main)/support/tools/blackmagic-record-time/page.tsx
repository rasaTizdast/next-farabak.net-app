import type { Metadata } from "next";

import { PublicShell } from "@/components/public/PublicShell";
import { getProductBySlug } from "@/lib/data/products";

import BlackmagicRecordTimeTool from "./BlackmagicRecordTimeTool";

export const metadata: Metadata = {
  title: "برنامه‌ریز زمان ضبط Blackmagic | فرابک",
  description:
    "برآورد زمان ضبط و ظرفیت رسانه برای تنظیمات دوربین Blackmagic با نرخ‌های رسمی سازنده و توضیح محدودیت‌ها.",
  alternates: { canonical: "/support/tools/blackmagic-record-time" },
};

export default async function BlackmagicRecordTimePage() {
  let productHref: string | null = null;
  try {
    const product = await getProductBySlug("pyxis-12k");
    if (product?.categorySlug === "blackmagic" && product.productSlug) {
      productHref = `/products/${product.categorySlug}/${product.subCategorySlug ?? "camera"}/${product.productSlug}`;
    }
  } catch {
    // The calculator remains useful when the catalog service is unavailable.
  }

  return (
    <PublicShell as="main" className="space-y-7 pt-6 pb-14 sm:pt-8 sm:pb-16 print:max-w-none print:px-0 print:pt-0">
      <BlackmagicRecordTimeTool productHref={productHref} />
    </PublicShell>
  );
}
