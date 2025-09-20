export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Script from "next/script";

import ImageSlider from "../_components/imageSlider/ImageSlider";
import ProductsShowCase from "../_components/LandingPage/ProductsShowCase";
import ProjectsSection from "../_components/LandingPage/ProjectsSection";
import SupportSection from "../_components/LandingPage/SupportSection";

type slider = {
  id: number;
  image_URL: string;
  link: string;
  image_alt: string | null;
};

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    },
  };
};

const HomePage = async () => {
  let sliderLinks = [];

  try {
    const response = await fetch(`${process.env.BASE_URL}/api/landingPage/sliders`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) throw new Error("Failed to fetch sliders");

    const sliders = await response.json();

    sliderLinks = sliders.map((slider: slider) => ({
      id: slider.id,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/${slider.image_URL}`,
      link: slider.link,
      alt: slider.image_alt || "فرابک محصولات امنیتی و نظارت تصویری",
    }));
  } catch (error) {
    console.error("Slider fetch error:", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://farabak.net",
        name: "فرابک",
        alternateName: "Farabak",
        url: "https://farabak.net",
        logo: {
          "@type": "ImageObject",
          url: "https://farabak.net/Farabak_Logo.webp",
          width: 150,
          height: 40,
        },
        description:
          "فرابک، واردکننده اصلی محصولات ریولینک و Smiths Detection و Ceia در ایران، ارائه‌دهنده انواع محصولات نظارتی و امنیتی با گارانتی معتبر، تضمین اصالت کالا و خدمات پس از فروش حرفه‌ای",
        foundingDate: "2020",
        address: {
          "@type": "PostalAddress",
          addressCountry: "IR",
          addressLocality: "تهران",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: process.env.NEXT_PUBLIC_SUPPORT_NUMBER,
          contactType: "customer service",
          availableLanguage: "Persian",
        },
        knowsAbout: [
          "Reolink Security Cameras",
          "Smiths Detection Security Products",
          "Ceia Security Products",
          "Surveillance Systems",
          "Security Equipment Import",
          "CCTV Systems",
        ],
        memberOf: {
          "@type": "Organization",
          name: "Iran Security Products Importers Association",
        },
        sameAs: ["https://farabak.net"],
      },
      {
        "@type": "WebSite",
        "@id": "https://farabak.net",
        url: "https://farabak.net",
        name: "فرابک - محصولات نظارتی و امنیتی",
        description: "خرید محصولات نظارتی و امنیتی با گارانتی معتبر | فرابک",
        publisher: {
          "@id": "https://farabak.net",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://farabak.net/search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
        inLanguage: "fa-IR",
      },
      {
        "@type": "WebPage",
        "@id": "https://farabak.net",
        url: "https://farabak.net",
        name: "خرید محصولات نظارتی و امنیتی با گارانتی معتبر | فرابک",
        isPartOf: {
          "@id": "https://farabak.net",
        },
        about: {
          "@id": "https://farabak.net",
        },
        description:
          "فرابک ارائه‌دهنده انواع محصولات نظارتی و امنیتی شامل دوربین مداربسته ریولینک با گارانتی معتبر، تضمین اصالت کالا و خدمات پس از فروش حرفه‌ای",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "خانه",
              item: "https://farabak.net",
            },
          ],
        },
        inLanguage: "fa-IR",
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://farabak.net",
        name: "فرابک",
        image: "https://farabak.net/Farabak_Logo.webp",
        description:
          "واردکننده اصلی محصولات ریولینک و Smiths Detection و Ceia در ایران - فروشگاه تخصصی محصولات نظارتی و امنیتی",
        url: "https://farabak.net",
        telephone: process.env.NEXT_PUBLIC_SUPPORT_NUMBER,
        address: {
          "@type": "PostalAddress",
          addressCountry: "IR",
          addressLocality: "تهران",
        },
        openingHours: "Mo-Su 09:00-18:00",
        priceRange: "$$",
        paymentAccepted: "Cash, Credit Card, Bank Transfer",
        currenciesAccepted: "IRR",
        areaServed: {
          "@type": "Country",
          name: "Iran",
        },
        serviceArea: {
          "@type": "Country",
          name: "Iran",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://farabak.net/#importer",
        name: "فرابک - واردکننده رسمی ریولینک و Smiths Detection و Ceia",
        description: "واردکننده اصلی و رسمی محصولات ریولینک و Smiths Detection و Ceia در ایران",
        url: "https://farabak.net",
        parentOrganization: {
          "@id": "https://farabak.net",
        },
        hasCredential: [
          {
            "@type": "EducationalOccupationalCredential",
            name: "Official Reolink Importer License",
            credentialCategory: "Import License",
          },
          {
            "@type": "EducationalOccupationalCredential",
            name: "Official Smiths Detection Importer License",
            credentialCategory: "Import License",
          },
          {
            "@type": "EducationalOccupationalCredential",
            name: "Official Ceia Importer License",
            credentialCategory: "Import License",
          },
        ],
        areaServed: {
          "@type": "Country",
          name: "Iran",
        },
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
        <ImageSlider slides={sliderLinks} />
        <ProductsShowCase />
        <ProjectsSection />
        <SupportSection />
      </div>
    </>
  );
};

export default HomePage;
