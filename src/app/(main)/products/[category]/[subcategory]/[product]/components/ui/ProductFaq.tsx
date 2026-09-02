import Faq, { type FaqItem } from "@/components/Faq";
import { getProductFaqs } from "@/lib/data/faqs";

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

  const items: FaqItem[] = faqs.map((faq) => ({
    id: faq.FAQsId,
    question: faq.Title,
    answer: faq.Description,
  }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Faq title="سوالات متداول محصول" items={items} />
    </>
  );
};

export default ProductFaq;
