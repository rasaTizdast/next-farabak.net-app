import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import SourcesList from "@/components/SourcesList";
import { BRAND_LABELS, buildSourcesFor, detectBrand } from "@/helpers/sources";
import { getProductBySlug } from "@/lib/data/products";
import { getPriceValidUntil } from "@/utils/priceValidUntil";

import ClientInvoiceSection from "./ui/ClientInvoiceSection";
import ProductBlog from "./ui/ProductBlog";
import ProductFaq from "./ui/ProductFaq";
import ProductFeatures from "./ui/ProductFeatures";
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

  const rawPrice = Number(productData.Price);
  const rawDiscount = Number(productData.Discount);
  const hasValidPrice = Number.isFinite(rawPrice) && rawPrice > 0;
  const hasValidDiscount =
    Number.isFinite(rawDiscount) && rawDiscount > 0 && rawDiscount < rawPrice;
  const finalPrice = hasValidDiscount ? rawPrice - rawDiscount : rawPrice;
  const priceValidUntil = getPriceValidUntil();

  const brandToken = detectBrand(productData.Type);
  const brandName = brandToken ? BRAND_LABELS[brandToken] : "فرابک";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}/${productData.subCategorySlug}/${productData.productSlug}`,
        name: productData.Type,
        description: productData.Description,
        image: `${process.env.LIARA_BUCKET_URL}/productImages/${productData.img2}`,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}/${productData.subCategorySlug}/${productData.productSlug}`,
        category: `${productData.categorySlug}/${productData.subCategorySlug}`,
        model: productData.Type,
        sku: `FAR-${productData.ProductId}`,
        brand: {
          "@type": "Brand",
          name: brandName,
        },
        manufacturer: {
          "@type": "Organization",
          "@id": "https://farabak.net",
          name: "فرابک",
          url: "https://farabak.net",
        },
        ...(hasValidPrice
          ? {
              offers: {
                "@type": "Offer",
                price: String(finalPrice),
                priceCurrency: "IRR",
                priceValidUntil,
                hasMerchantReturnPolicy: {
                  "@type": "MerchantReturnPolicy",
                  applicableCountry: "IR",
                  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                  merchantReturnDays: 7,
                  returnMethod: "https://schema.org/ReturnByMail",
                },
                shippingDetails: [
                  {
                    "@type": "OfferShippingDetails",
                    shippingDestination: {
                      "@type": "DefinedRegion",
                      addressCountry: "IR",
                    },
                    shippingRate: {
                      "@type": "MonetaryAmount",
                      value: "0",
                      currency: "IRR",
                    },
                    deliveryTime: {
                      "@type": "ShippingDeliveryTime",
                      handlingTime: {
                        "@type": "QuantitativeValue",
                        minValue: 1,
                        maxValue: 5,
                        unitCode: "DAY",
                      },
                      transitTime: {
                        "@type": "QuantitativeValue",
                        minValue: 2,
                        maxValue: 5,
                        unitCode: "DAY",
                      },
                    },
                  },
                ],
              },
            }
          : {}),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}/${productData.subCategorySlug}/${productData.productSlug}`,
        },
      },
    ],
  };

  const jsonLd = JSON.stringify(structuredData);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Breadcrumb breadcrumbs={breadCrumbs} />
      <section className="flex flex-[3_1] justify-between gap-8 max-[950px]:flex-col">
        <Image
          src={`${process.env.LIARA_BUCKET_URL}/productImages/${productData.img2}`}
          alt={productData.Type}
          width={1920}
          height={1080}
          quality={75}
          priority
          className="aspect-video w-[60%] flex-[2.5] self-start rounded-md object-contain shadow-[0_4px_10px_rgba(0,0,0,0.2)] max-[950px]:w-full min-[2000px]:flex-3"
        />

        <div className="flex w-full flex-[1.2] flex-col items-start justify-between rounded-lg bg-[#fafafa] p-4 shadow-[0_4px_10px_rgba(0,0,0,0.2)] min-[1200px]:max-w-[385px]">
          <div className="mb-2 max-w-full text-[1.1rem] font-light wrap-break-word max-[950px]:flex max-[950px]:w-full max-[950px]:flex-col max-[950px]:items-start max-[950px]:justify-between">
            <div>{productData.Type}</div>
            <h1 className="mb-8 text-justify text-[1.2rem] font-bold max-[840px]:mt-4 max-[840px]:mb-2">
              {productData.Name}
            </h1>
          </div>

          <Suspense fallback={<SkeletonFeatures />}>
            <ProductFeatures productId={productData.ProductId} />
          </Suspense>

          <ClientInvoiceSection
            ProductId={productData.ProductId}
            ProductName={productData.Type}
            productPrice={productData.Price}
            productDiscount={productData.Discount}
            minimumAmount={productData.Minimum_Amount}
            maximumAmount={productData.Maximum_Amount}
          />
        </div>
      </section>
      <ProductTabs />
      <section id="overview" className="flex flex-col items-center gap-10">
        <Suspense fallback={<SkeletonOverview />}>
          <ProductOverview productId={productData.ProductId} />
        </Suspense>
      </section>

      <section id="blog" className="flex flex-col items-center gap-10">
        <Suspense fallback={<SkeletonBlog />}>
          <ProductBlog productBlog={productData.productBlog} />
        </Suspense>
      </section>

      <section id="specs" className="mt-8 flex flex-col items-center gap-10">
        <Suspense fallback={<SkeletonSpecs />}>
          <ProductSpecs productId={productData.ProductId} />
        </Suspense>
      </section>

      <section id="faq" className="mt-8 flex flex-col items-center gap-10">
        <Suspense fallback={<SkeletonFaq />}>
          <ProductFaq productId={productData.ProductId} />
        </Suspense>
      </section>

      <SourcesList sources={buildSourcesFor(productData.Type)} className="mt-8" />

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
