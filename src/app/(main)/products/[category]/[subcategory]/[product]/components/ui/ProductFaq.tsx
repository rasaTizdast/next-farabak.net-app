import axios from "axios";
import React from "react";

import FaqAccordion from "./FaqAccordion";

type FAQItem = {
  FAQsId: number;
  Title: string;
  Description: string;
};

type ProductFaqProps = {
  productId: number;
};

// Server component for SEO benefits
const ProductFaq = async ({ productId }: ProductFaqProps) => {
  // Fetch FAQs server-side
  let faqs: FAQItem[] = [];

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/faqs/product/${productId}`
    );
    faqs = response.data;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
  }

  if (faqs.length === 0) {
    return (
      <div className="mt-6 flex w-full justify-center rounded-lg bg-gray-200 py-4 text-sm font-semibold text-slate-800 sm:mt-0 md:text-base">
        سوالی برای این محصول یافت نشد
      </div>
    );
  }

  // Generate FAQ schema for structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.Title,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.Description,
      },
    })),
  };

  return (
    <>
      {/* Add structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <h2 className="bg-blue-500 p-4 text-center text-xl font-bold text-white">سوالات متداول</h2>
        <div className="space-y-2 p-4">
          {/* Client-side interactive component */}
          <FaqAccordion faqs={faqs} />
        </div>
      </div>
    </>
  );
};

export default ProductFaq;
