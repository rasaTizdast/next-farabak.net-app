import { getProductFaqs } from "@/lib/data/faqs";

import FaqAccordion from "./FaqAccordion";

type FAQItem = {
  FAQsId: number;
  Title: string;
  Description: string;
};

type ProductFaqProps = {
  productId: number;
};

const ProductFaq = async ({ productId }: ProductFaqProps) => {
  let faqs: FAQItem[] = [];

  try {
    faqs = (await getProductFaqs(productId)) as FAQItem[];
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="flex w-full max-w-[calc(1900px-20rem)] flex-col rounded-lg bg-white p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)] max-[576px]:px-2 max-[576px]:py-4">
        <h3 className="mb-8 text-center text-[1.3rem] font-extrabold max-[576px]:mb-4">
          سوالات متداول
        </h3>
        <FaqAccordion faqs={faqs} />
      </div>
    </>
  );
};

export default ProductFaq;
