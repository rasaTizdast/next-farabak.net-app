// Components
import { Metadata } from "next";
import { io } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SITE_URL } from "@/constants/meta";
import { formatTitle } from "@/helpers/formatTitle";
import { getProductBySlug } from "@/lib/data/products";
import { getProductImageUrl } from "@/lib/seo/product-image-url";

import ProductDataWrapper from "./components/ProductDataWrapper";
import { ProductMainSkeleton } from "./components/ui/Skeletons";

// Types
interface ProductPageProps {
  params: Promise<{ category: string; subcategory: string; product: string }>;
  searchParams: Promise<{ key: string }>;
}

// Metadata generation
export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const productSlug = params.product;

  const data = (await getProductBySlug(productSlug)) as any;

  if (!data) notFound();

  // Check if the product is not available and does not have a QR code key
  if (!data.Available && !data.QrCode_key) notFound();

  // Check QR code conditions
  if (data.QrCode_key) {
    const { key: urlKey } = searchParams;

    // If there's no key in the URL or the key in the URL doesn't match the product's QR code key
    if (!urlKey || urlKey !== data.QrCode_key) notFound();

    // Check if the QR code has expired
    await io();
    const expiryDate = new Date(data.QrCode_expiryDays);
    if (new Date() > expiryDate) notFound();
  }

  const title = formatTitle(data.SEO_Title || data.Type, 60);
  const description = data.SEO_Description || data.Name;
  const canonicalUrl = new URL(
    `/products/${data.categorySlug}/${data.subCategorySlug}/${data.productSlug}`,
    SITE_URL
  ).toString();
  const imageUrl = getProductImageUrl(data.img2, data.img1);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  return (
    <div dir="rtl">
      <Suspense fallback={<ProductMainSkeleton />}>
        <ProductDataWrapper params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
