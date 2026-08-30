// Components
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { Suspense } from "react";

import { formatTitle } from "@/helpers/formatTitle";

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

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductBySlug/${productSlug}`;

  try {
    const res = await fetch(apiUrl, { next: { revalidate: 60 } });

    if (!res || !res.ok) {
      return {
        title: "محصولی یافت نشد | فرابک",
        description: "محصول مورد نظر یافت نشد.",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const data = await res.json();

    if (!data) {
      return {
        title: "محصولی یافت نشد | فرابک",
        description: "محصول مورد نظر یافت نشد.",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    // Check if the product is not available and does not have a QR code key
    if (!data.Available && !data.QrCode_key) {
      return {
        title: "محصولی یافت نشد | فرابک",
        description: "محصول مورد نظر یافت نشد.",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    // Check QR code conditions
    if (data.QrCode_key) {
      const { key: urlKey } = searchParams;

      // If there's no key in the URL or the key in the URL doesn't match the product's QR code key
      if (!urlKey || urlKey !== data.QrCode_key) {
        return {
          title: "محصولی یافت نشد | فرابک",
          description: "محصول مورد نظر یافت نشد.",
          robots: {
            index: false,
            follow: true,
          },
        };
      }

      // Check if the QR code has expired
      const expiryDate = new Date(data.QrCode_expiryDays);
      if (new Date() > expiryDate) {
        return {
          title: "محصولی یافت نشد | فرابک",
          description: "محصول مورد نظر یافت نشد.",
          robots: {
            index: false,
            follow: true,
          },
        };
      }
    }

    return {
      title: formatTitle(data.SEO_Title || data.Type, 60),
      description: data.SEO_Description || data.Name,
      openGraph: {
        title: data.SEO_Title,
        description: data.SEO_Description,
        images: [`/productImages/${data.img2}`],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${params.category}/${data.subCategorySlug}/${params.product}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error: unknown) {
    console.error(error);
    return {
      title: "محصولی یافت نشد | فرابک",
      description: "محصول مورد نظر یافت نشد.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  return (
    <div
      dir="rtl"
      className={cn("rounded-lg bg-[var(--dark-blue)] shadow-[0_4px_10px_rgba(0,0,0,0.1)]")}
    >
      <Suspense fallback={<ProductMainSkeleton />}>
        <ProductDataWrapper params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
