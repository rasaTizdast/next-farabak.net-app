import React from "react";
import axios from "axios";
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
      <div className="w-full py-4 bg-gray-200 flex justify-center text-slate-800 rounded-lg mt-6 sm:mt-0 text-sm md:text-base font-semibold">
        سوالی برای این محصول یافت نشد
      </div>
    );
  }

  // Generate FAQ schema for structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.Title,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.Description
      }
    }))
  };

  return (
    <>
      {/* Add structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-bold bg-blue-500 text-white p-4 text-center">سوالات متداول</h2>
        <div className="p-4 space-y-2">
          {/* Client-side interactive component */}
          <FaqAccordion faqs={faqs} />
        </div>
      </div>
    </>
  );
};

export default ProductFaq;
