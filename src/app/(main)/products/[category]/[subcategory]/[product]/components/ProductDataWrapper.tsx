import { io } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import SourcesList from "@/components/SourcesList";
import { BRAND_LABELS, buildSourcesFor, detectBrand } from "@/helpers/sources";
import { getProductBySlug } from "@/lib/data/products";
import { getProductImageUrl } from "@/lib/seo/product-image-url";

import ClientInvoiceSection from "./ui/ClientInvoiceSection";
import ProductBlog from "./ui/ProductBlog";
import ProductFaq from "./ui/ProductFaq";
import ProductFeatures from "./ui/ProductFeatures";
import ProductGallery from "./ui/ProductGallery";
import ProductOverview from "./ui/ProductOverviewDetails";
import ProductSpecs from "./ui/ProductSpecs";
import ProductTabs from "./ui/ProductTabs";
import SimilarProducts from "./ui/SimilarProducts";
import {
  SkeletonFeatures,
  SkeletonOverview,
  SkeletonBlog,
  SkeletonSpecs,
  SkeletonFaq,
} from "./ui/Skeletons";

interface ProductData {
  Available: boolean;
  ProductId: number;
  Name: string;
  Type: string;
  img1: string | null;
  img2: string | null;
  Price: string;
  Discount: string;
  Description: string;
  categorySlug: string;
  subCategorySlug: string;
  productSlug: string;
  SEO_Title: string;
  SEO_Description: string;
  QrCode_key: string;
  QrCode_expiryDays: string;
  productBlog: string;
  Minimum_Amount?: number;
  Maximum_Amount?: number;
}

async function getProduct(slug: string): Promise<ProductData | null> {
  try {
    return (await getProductBySlug(slug)) as ProductData | null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function ProductDataWrapper({
  params,
  searchParams,
}: {
  params: { category: string; product: string };
  searchParams: { key: string };
}) {
  // QR expiry and price validity are request-time values, not static-shell data.
  await io();
  const productData = await getProduct(params.product);

  if (!productData) {
    notFound();
  }

  if (!productData.Available && !productData.QrCode_key) {
    notFound();
  }

  if (productData.QrCode_key) {
    const { key: urlKey } = searchParams;

    if (!urlKey || urlKey !== productData.QrCode_key) {
      notFound();
    }

    const expiryDate = new Date(productData.QrCode_expiryDays);
    if (new Date() > expiryDate) {
      notFound();
    }
  }

  const breadCrumbs = [
    "/",
    "/products",
    `/products/${productData.categorySlug}`,
    `/products/${productData.categorySlug}/${productData.subCategorySlug}`,
  ];

  const brandToken = detectBrand(productData.Type);
  const productModel = productData.Type || productData.Name || "محصول فرابک";
  const productDescription = productData.Name?.trim();
  const productSchemaDescription = productData.Description?.trim();
  const canonicalUrl = new URL(
    `/products/${productData.categorySlug}/${productData.subCategorySlug}/${productData.productSlug}`,
    process.env.NEXT_PUBLIC_BASE_URL || "https://farabak.net"
  ).toString();
  const imageUrl = getProductImageUrl(productData.img2);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": canonicalUrl,
        name: productModel,
        ...(productSchemaDescription ? { description: productSchemaDescription } : {}),
        image: imageUrl,
        url: canonicalUrl,
        category: `${productData.categorySlug}/${productData.subCategorySlug}`,
        model: productData.Type,
        sku: `FAR-${productData.ProductId}`,
        ...(brandToken
          ? {
              brand: {
                "@type": "Brand",
                name: BRAND_LABELS[brandToken],
              },
            }
          : {}),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
      },
    ],
  };

  // Price is stored in USD and converted to an estimated Toman price at a live rate.
  // The catalog has no stock or stable ISO-currency offer source, so do not claim an Offer.
  const jsonLd = JSON.stringify(structuredData).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Breadcrumb breadcrumbs={breadCrumbs} />
      <section aria-labelledby="product-dossier-title" className="py-4 md:py-8">
        <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <ProductGallery title={productModel} images={[imageUrl]} />

          <aside className="flex h-full flex-col rounded-2xl border border-(--farabak-ink-deep)/10 bg-white p-5 shadow-[0_18px_45px_rgba(6,26,48,0.08)] sm:p-7">
            <p className="text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
              پرونده فنی محصول
            </p>
            <h1
              id="product-dossier-title"
              className="mt-4 text-2xl leading-10 font-bold text-(--farabak-ink-deep) sm:text-3xl"
            >
              {productModel}
            </h1>
            {productDescription && productDescription !== productModel ? (
              <p className="mt-3 text-sm leading-7 text-(--farabak-ink-muted)">
                {productDescription}
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-3 border-y border-(--farabak-ink-deep)/10 py-4 text-sm">
              <div>
                <span className="block text-xs text-(--farabak-ink-muted)">کد محصول</span>
                <span
                  dir="ltr"
                  className="mt-1 block font-mono font-semibold text-(--farabak-ink-deep)"
                >
                  <bdi>FAR-{productData.ProductId}</bdi>
                </span>
              </div>
              <div>
                <span className="block text-xs text-(--farabak-ink-muted)">وضعیت</span>
                <span className="mt-1 block font-semibold text-(--farabak-action-blue)">
                  قابل بررسی برای سفارش
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-(--farabak-ink-deep)/10 pt-5">
              <p className="mb-3 text-sm font-bold text-(--farabak-ink-deep)">ویژگی‌های کلیدی</p>
              <Suspense fallback={<SkeletonFeatures />}>
                <ProductFeatures productId={productData.ProductId} />
              </Suspense>
            </div>

            <div className="mt-auto border-t border-(--farabak-ink-deep)/10 pt-5">
              <ClientInvoiceSection
                ProductId={productData.ProductId}
                ProductName={productData.Type}
                productPrice={productData.Price}
                productDiscount={productData.Discount}
                minimumAmount={productData.Minimum_Amount}
                maximumAmount={productData.Maximum_Amount}
              />
            </div>
          </aside>
        </div>
      </section>
      <ProductTabs />
      <section
        id="overview"
        aria-labelledby="overview-heading"
        className="flex w-full scroll-mt-32 flex-col items-center gap-10"
      >
        <h2 id="overview-heading" className="sr-only">
          توضیحات محصول
        </h2>
        <Suspense fallback={<SkeletonOverview />}>
          <ProductOverview productId={productData.ProductId} />
        </Suspense>
      </section>

      <section
        id="blog"
        aria-labelledby="blog-heading"
        className="flex w-full scroll-mt-32 flex-col items-center gap-10"
      >
        <h2 id="blog-heading" className="sr-only">
          توضیحات تکمیلی محصول
        </h2>
        <Suspense fallback={<SkeletonBlog />}>
          <ProductBlog productBlog={productData.productBlog} />
        </Suspense>
      </section>

      <section
        id="specs"
        aria-labelledby="specs-heading"
        className="mt-10 flex w-full scroll-mt-32 flex-col items-center gap-10"
      >
        <h2 id="specs-heading" className="sr-only">
          مشخصات محصول
        </h2>
        <Suspense fallback={<SkeletonSpecs />}>
          <ProductSpecs productId={productData.ProductId} />
        </Suspense>
      </section>

      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="flex w-full scroll-mt-32 flex-col items-center gap-10"
      >
        <h2 id="faq-heading" className="sr-only">
          سوالات متداول محصول
        </h2>
        <Suspense fallback={<SkeletonFaq />}>
          <ProductFaq productId={productData.ProductId} />
        </Suspense>
      </section>

      <section className="mt-8 flex w-full flex-col items-center">
        <SourcesList sources={buildSourcesFor(productData.Type)} />
      </section>

      <div className="my-10 h-px w-full bg-gray-200" aria-hidden="true" />
      <SimilarProducts
        currentProductId={productData.ProductId}
        currentProductSlug={productData.productSlug}
        categorySlug={productData.categorySlug}
        subCategorySlug={productData.subCategorySlug}
      />
    </>
  );
}
