// app/products/[category]/[product]/page.tsx
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

// Types
interface ProductData {
  ProductId: number;
  Name: string;
  Type: string;
  img2: string;
  Description: string;
  categorySlug: string;
  subCategorySlug: string;
  // Add other fields as needed
}

// Metadata generation
export async function generateMetadata({
  params,
}: {
  params: { category: string; product: string };
}): Promise<Metadata> {
  const product = await getProduct(params.product);

  if (!product) {
    return {
      title: "محصولی یافت نشد | فرابک",
      description: "محصول مورد نظر یافت نشد.",
    };
  }

  return {
    title: `${product.Type} | فرابک`,
    description: product.Description,
    openGraph: {
      title: `${product.Type} | فرابک`,
      description: product.Description,
      images: [`/productImages/${product.img2}`],
    },
  };
}

// Data fetching
async function getProduct(slug: string): Promise<ProductData | null> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductBySlug/${slug}`
    );

    if (!res) return null;
    return res.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: { category: string; product: string };
}) {
  const productData = await getProduct(params.product);

  if (!productData) {
    notFound();
  }
  const breadCrumbs = [
    { href: "/", path: "/" },
    { href: "/products", path: "/products" },
    {
      href: `/products/${productData.categorySlug}`,
      path: `/products/${productData.categorySlug}`,
    },
    {
      href: `/products/${productData.categorySlug}/${productData.subCategorySlug}`,
      path: `/products/${productData.categorySlug}/${productData.subCategorySlug}`,
    },
  ];
  return (
    <>
      <Breadcrumb breadcrumbs={breadCrumbs} />
      {/* Main Product Section */}
      <section className={styles.head}>
        <Image
          src={`/productImages/${productData.img2}`}
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

          <ClientInvoiceSection product={{ type: productData.Type }} />
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
      <section id="specs" className={`${styles.section} mt-16`}>
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
      <section id="faq" className={`${styles.section} mt-16`}>
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
