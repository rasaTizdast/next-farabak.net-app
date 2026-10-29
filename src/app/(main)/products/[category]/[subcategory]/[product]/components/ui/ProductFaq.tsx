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
    return null;
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
      <div
        data-product-section-content
        className="flex w-full max-w-[calc(1900px-20rem)] flex-col rounded-2xl border border-(--farabak-ink-deep)/10 bg-white p-5 shadow-[0_18px_45px_rgba(6,26,48,0.06)] sm:p-7"
      >
        <h3 className="mb-5 text-start text-xl font-bold text-(--farabak-ink-deep) max-[576px]:mb-4">
          سوالات متداول
        </h3>
        <FaqAccordion faqs={faqs} />
      </div>
    </>
  );
};

export default ProductFaq;
