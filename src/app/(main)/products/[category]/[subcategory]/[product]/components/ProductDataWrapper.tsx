import axios from "axios";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
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
          name: "فرابک",
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
    ],
  };

  const jsonLd = JSON.stringify(structuredData);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Breadcrumb breadcrumbs={breadCrumbs} />
      <section className="flex flex-col items-center justify-between gap-6">
        <Image
          src={`${process.env.LIARA_BUCKET_URL}/productImages/${productData.img2}`}
          alt={productData.Type}
          width={1340}
          height={780}
          quality={75}
          priority
          className="flex shrink-0 w-64 max-w-[1300px] h-auto max-h-[400px] object-cover rounded-md shadow-md"
        />

        <div className="bg-white p-4 rounded shadow-md w-full flex-1 flex-col items-start justify-between">
          <div className="text-[1.1rem] font-light mb-2 break-words max-w-full">
            <div>{productData.Type}</div>
            <h1 className="text-[1.2rem] font-bold text-justify mb-2">{productData.Name}</h1>
          </div>

          <Suspense fallback={<SkeletonFeatures />}>
            <ProductFeatures productId={productData.ProductId} />
          </Suspense>
        </div>
      </section>
      <ProductTabs />
      <section id="overview" className="rounded-lg bg-white p-8 shadow-md">
        <Suspense fallback={<> <SkeletonOverview /> </>}>
          <ProductOverview productId={productData.ProductId} />
        </Suspense>
      </section>

      <section id="blog" className="rounded-lg bg-white p-8 shadow-md">
        <Suspense fallback={<> <SkeletonBlog /> </>}>
          <ProductBlog productBlog={productData.productBlog} />
        </Suspense>
      </section>

      <section id="specs" className="rounded-lg bg-white p-8 shadow-md mt-8">
        <Suspense fallback={<> <SkeletonSpecs /> </>}>
          <ProductSpecs productId={productData.ProductId} />
        </Suspense>
      </section>

      <section id="faq" className="rounded-lg bg-white p-8 shadow-md mt-8">
        <Suspense fallback={<> <SkeletonFaq /> </>}>
          <ProductFaq productId={productData.ProductId} />
        </Suspense>
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