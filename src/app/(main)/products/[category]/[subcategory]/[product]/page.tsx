import { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import styles from "./ProductPage.module.css";

// Components
import ProductFeatures from "./components/ui/ProductFeatures";
import ProductOverview from "./components/ui/ProductOverviewDetails";
import ProductSpecs from "./components/ui/ProductSpecs";
import ProductFaq from "./components/ui/ProductFaq";
import { SkeletonFeatures } from "./components/ui/Skeletons";
import { notFound } from "next/navigation";
import axios from "axios";
import ClientInvoiceSection from "./components/ui/ClientInvoiceSection";
import ProductTabs from "./components/ui/ProductTabs";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { formatTitle } from "@/helpers/formatTitle";

// Types
interface ProductData {
  Available: boolean;
  ProductId: number;
  Name: string;
  Type: string;
  img2: string;
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
}

// Metadata generation
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { category: string; product: string };
  searchParams: { key: string };
}): Promise<Metadata> {
  const product = await getProduct(params.product);

  // Check if the product data exists
  if (!product) {
    return {
      title: "محصولی یافت نشد | فرابک",
      description: "محصول مورد نظر یافت نشد.",
    };
  }

  // Check if the product is not available and does not have a QR code key
  if (!product.Available && !product.QrCode_key) {
    return {
      title: "محصولی یافت نشد | فرابک",
      description: "محصول مورد نظر یافت نشد.",
    };
  }

  // Check QR code conditions
  if (product.QrCode_key) {
    const { key: urlKey } = searchParams;

    // If there's no key in the URL or the key in the URL doesn't match the product's QR code key
    if (!urlKey || urlKey !== product.QrCode_key) {
      return {
        title: "محصولی یافت نشد | فرابک",
        description: "محصول مورد نظر یافت نشد.",
      };
    }

    // Check if the QR code has expired
    const expiryDate = new Date(product.QrCode_expiryDays);
    if (new Date() > expiryDate) {
      return {
        title: "محصولی یافت نشد | فرابک",
        description: "محصول مورد نظر یافت نشد.",
      };
    }
  }

  return {
    title: formatTitle(product.SEO_Title || product.Type, 60),
    description: product.SEO_Description || product.Name,
    openGraph: {
      title: product.SEO_Title,
      description: product.SEO_Description,
      images: [`/productImages/${product.img2}`],
    },
    robots: {
      index: false, // This sets the noindex directive
      follow: true, // Allows crawling of links on the page if needed
    },
  };
}
// Data fetching
async function getProduct(slug: string): Promise<ProductData | null> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductBySlug/${slug}`
    );

    if (!res || !res.data) return null;

    const product = res.data;

    return product;
  } catch (error) {
    return null;
  }
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: { category: string; product: string };
  searchParams: { key: string };
}) {
  const productData = await getProduct(params.product);

  // Check if the product data exists
  if (!productData) {
    notFound();
  }

  // Check if the product is not available and does not have a QR code key
  if (!productData.Available && !productData.QrCode_key) {
    notFound();
  }

  // Check QR code conditions
  if (productData.QrCode_key) {
    const { key: urlKey } = searchParams;

    // If there's no key in the URL or the key in the URL doesn't match the product's QR code key
    if (!urlKey || urlKey !== productData.QrCode_key) {
      notFound();
    }

    // Check if the QR code has expired
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

  return (
    <>
      <Breadcrumb breadcrumbs={breadCrumbs} />
      {/* Main Product Section */}
      <section className={styles.head}>
        <Image
          src={`${process.env.LIARA_BUCKET_URL}/productImages/${productData.img2}`}
          alt={productData.Type}
          width={1340}
          height={780}
          quality={100}
          priority
          className={styles.productImage}
        />

        <div className={styles.desc}>
          <div className={styles.descDetails}>
            <div className={styles.details}>
              <div>{productData.Type}</div>
              <h1>{productData.Name}</h1>
            </div>

            <Suspense fallback={<SkeletonFeatures />}>
              <ProductFeatures productId={productData.ProductId} />
            </Suspense>
          </div>

          <ClientInvoiceSection
            productPrice={productData.Price}
            productDiscount={productData.Discount}
            ProductId={productData.ProductId}
            ProductName={productData.Type}
          />
        </div>
      </section>
      {/* Navigation */}
      <ProductTabs />
      {/* Content Sections */}
      <section id="overview" className={styles.section}>
        <Suspense
          fallback={
            <div className="w-full py-4 bg-gray-200 animate-pulse flex justify-center text-slate-800 rounded-lg mt-6 sm:mt-0 text-sm md:text-base font-semibold">
              درحال بارگذاری توضیحات
            </div>
          }
        >
          <ProductOverview productId={productData.ProductId} />
        </Suspense>
      </section>
      <section id="specs" className={`${styles.section} mt-8`}>
        <Suspense
          fallback={
            <div className="w-full py-4 bg-gray-200 animate-pulse flex justify-center text-slate-800 rounded-lg mt-6 sm:mt-0 text-sm md:text-base font-semibold">
              درحال بارگذاری مشخصات
            </div>
          }
        >
          <ProductSpecs productId={productData.ProductId} />
        </Suspense>
      </section>
      <section id="faq" className={`${styles.section} mt-8`}>
        <Suspense
          fallback={
            <div className="w-full py-4 bg-gray-200 animate-pulse flex justify-center text-slate-800 rounded-lg mt-6 sm:mt-0 text-sm md:text-base font-semibold">
              درحال بارگذاری سوالات
            </div>
          }
        >
          <ProductFaq />
        </Suspense>
      </section>
    </>
  );
}
