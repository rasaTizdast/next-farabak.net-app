// Components
import axios from "axios";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { formatTitle } from "@/helpers/formatTitle";

import ClientInvoiceSection from "./components/ui/ClientInvoiceSection";
import ProductBlog from "./components/ui/ProductBlog";
import ProductFaq from "./components/ui/ProductFaq";
import ProductFeatures from "./components/ui/ProductFeatures";
import ProductOverview from "./components/ui/ProductOverviewDetails";
import ProductSpecs from "./components/ui/ProductSpecs";
import ProductTabs from "./components/ui/ProductTabs";
import { SkeletonFeatures } from "./components/ui/Skeletons";
import styles from "./ProductPage.module.css";

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
  productBlog: string;
}

// Metadata generation
export async function generateMetadata(props: {
  params: Promise<{ category: string; product: string }>;
  searchParams: Promise<{ key: string }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
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
      index: true, // This sets the noindex directive
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
    console.error(error);
    return null;
  }
}

export default async function ProductPage(props: {
  params: Promise<{ category: string; product: string }>;
  searchParams: Promise<{ key: string }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
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

  // Prepare structured data for Schema.org
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productData.Name,
    description: productData.Description,
    image: `${process.env.LIARA_BUCKET_URL}/productImages/${productData.img2}`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}/${productData.subCategorySlug}/${productData.productSlug}`,
    category: `${productData.categorySlug}/${productData.subCategorySlug}`,
    model: productData.Type,
    sku: `FAR-${productData.ProductId}`,
    brand: {
      "@type": "Brand",
      name: "فرابک",
    },
    offers:
      productData.Discount && productData.Discount !== "0"
        ? {
            "@type": "Offer",
            price: productData.Price,
            priceCurrency: "IRR",
            availability: productData.Available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            priceValidUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
            seller: {
              "@type": "Organization",
              name: "فرابک",
            },
          }
        : {
            "@type": "Offer",
            price: productData.Price,
            priceCurrency: "IRR",
            availability: productData.Available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            seller: {
              "@type": "Organization",
              name: "فرابک",
            },
          },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "صفحه اصلی",
          item: process.env.NEXT_PUBLIC_BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "محصولات",
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/products`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: productData.categorySlug,
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: productData.subCategorySlug,
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}/${productData.subCategorySlug}`,
        },
        {
          "@type": "ListItem",
          position: 5,
          name: productData.Name,
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}/${productData.subCategorySlug}/${productData.productSlug}`,
        },
      ],
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}/${productData.subCategorySlug}/${productData.productSlug}`,
    },
    manufacturer: {
      "@type": "Organization",
      name: "فرابک",
      url: process.env.NEXT_PUBLIC_BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
            <div className="mt-6 flex w-full animate-pulse justify-center rounded-lg bg-gray-200 py-4 text-sm font-semibold text-slate-800 sm:mt-0 md:text-base">
              درحال بارگذاری توضیحات
            </div>
          }
        >
          <ProductOverview productId={productData.ProductId} />
        </Suspense>
      </section>

      <section id="blog" className={styles.section}>
        <Suspense
          fallback={
            <div className="mt-6 flex w-full animate-pulse justify-center rounded-lg bg-gray-200 py-4 text-sm font-semibold text-slate-800 sm:mt-0 md:text-base">
              درحال بارگذاری توضیحات تکمیلی
            </div>
          }
        >
          <ProductBlog productBlog={productData.productBlog} />
        </Suspense>
      </section>

      <section id="specs" className={`${styles.section} mt-8`}>
        <Suspense
          fallback={
            <div className="mt-6 flex w-full animate-pulse justify-center rounded-lg bg-gray-200 py-4 text-sm font-semibold text-slate-800 sm:mt-0 md:text-base">
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
            <div className="mt-6 flex w-full animate-pulse justify-center rounded-lg bg-gray-200 py-4 text-sm font-semibold text-slate-800 sm:mt-0 md:text-base">
              درحال بارگذاری سوالات
            </div>
          }
        >
          <ProductFaq productId={productData.ProductId} />
        </Suspense>
      </section>
    </>
  );
}
