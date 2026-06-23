import axios from "axios";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getPriceValidUntil } from "@/utils/priceValidUntil";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";

import styles from "../ProductPage.module.css";
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

export default async function ProductDataWrapper({ params, searchParams }: {
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
                  returnFees: "https://schema.org/FreeReturn",
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
                availability: productData.Available
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                seller: {
                  "@id": "https://farabak.net",
                },
              },
            }
          : {}),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}/${productData.subCategorySlug}/${productData.productSlug}`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}/${productData.subCategorySlug}/${productData.productSlug}`,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}/${productData.subCategorySlug}/${productData.productSlug}`,
        name: productData.SEO_Title || productData.Type,
        description: productData.SEO_Description || productData.Description,
        isPartOf: {
          "@type": "WebSite",
          "@id": "https://farabak.net",
        },
        about: {
          "@type": "Product",
          "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}/${productData.subCategorySlug}/${productData.productSlug}`,
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "خانه",
              item: "https://farabak.net",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "محصولات",
              item: "https://farabak.net/products",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: productData.categorySlug,
              item: `https://farabak.net/products/${productData.categorySlug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: productData.subCategorySlug,
              item: `https://farabak.net/products/${productData.categorySlug}/${productData.subCategorySlug}`,
            },
            {
              "@type": "ListItem",
              position: 5,
              name: productData.Type,
              item: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.categorySlug}/${productData.subCategorySlug}/${productData.productSlug}`,
            },
          ],
        },
        inLanguage: "fa-IR",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumb breadcrumbs={breadCrumbs} />
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
            minimumAmount={productData.Minimum_Amount}
            maximumAmount={productData.Maximum_Amount}
          />
        </div>
      </section>
      <ProductTabs />
      <section id="overview" className={styles.section}>
        <Suspense fallback={<SkeletonOverview />}>
          <ProductOverview productId={productData.ProductId} />
        </Suspense>
      </section>

      <section id="blog" className={styles.section}>
        <Suspense fallback={<SkeletonBlog />}>
          <ProductBlog productBlog={productData.productBlog} />
        </Suspense>
      </section>

      <section id="specs" className={`${styles.section} mt-8`}>
        <Suspense fallback={<SkeletonSpecs />}>
          <ProductSpecs productId={productData.ProductId} />
        </Suspense>
      </section>

      <section id="faq" className={`${styles.section} mt-8`}>
        <Suspense fallback={<SkeletonFaq />}>
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