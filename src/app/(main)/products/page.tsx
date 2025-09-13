export const dynamic = "force-dynamic";

// src/app/products/page.tsx

import { Metadata } from "next";
import Script from "next/script";

import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";

interface ProductsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export const generateMetadata = async (props: ProductsPageProps): Promise<Metadata> => {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page || "1", 10);

  return {
    title: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
    description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    openGraph: {
      title: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
      description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
    },
  };
};

const ProductsPage = async (props: ProductsPageProps) => {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page || "1", 10);
  const limit = 30;

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getAllProducts?page=${currentPage}&limit=${limit}`;

  // Pass paths instead of Persian names
  const breadcrumbs = ["/", "/products"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://farabak.net/products?page=${currentPage}`,
        url: `https://farabak.net/products?page=${currentPage}`,
        name: `تمامی محصولات - صفحه ${currentPage} | فرابک`,
        description: `با مرور در صفحه ${currentPage} از محصولات ما، تنوع گسترده‌ای از محصولات فرابک را کشف کنید و انتخاب کنید.`,
        isPartOf: {
          "@id": "https://farabak.net",
        },
        about: {
          "@id": "https://farabak.net",
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
          ],
        },
        mainEntity: {
          "@type": "ItemList",
          name: "محصولات فرابک",
          description:
            "مجموعه‌ای از محصولات نظارتی و امنیتی شامل دوربین‌های مداربسته ریولینک و محصولات امنیتی Smiths Detection و Ceia",
          numberOfItems: "30+",
          itemListElement: {
            "@type": "Product",
            name: "محصولات نظارتی و امنیتی",
            description: "دوربین‌های مداربسته، سیستم‌های نظارتی و محصولات امنیتی با کیفیت بالا",
            brand: [
              {
                "@type": "Brand",
                name: "Reolink",
              },
              {
                "@type": "Brand",
                name: "Smiths Detection",
              },
              {
                "@type": "Brand",
                name: "Ceia",
              },
            ],
            category: "Security Equipment",
          },
        },
        inLanguage: "fa-IR",
      },
    ],
  };

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <Breadcrumb breadcrumbs={breadcrumbs} />
        <ProductGrid title="تمامی محصولات" apiUrl={apiUrl} currentPage={currentPage} />
      </div>
    </>
  );
};

export default ProductsPage;
