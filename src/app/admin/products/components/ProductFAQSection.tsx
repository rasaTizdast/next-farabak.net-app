import { FAQItem } from "./ProductValidation";

export function deriveFaqErrors(faqs: FAQItem[]): { [key: string]: string } {
  if (faqs.length === 0) return {};
  const errors: { [key: string]: string } = {};
  faqs.forEach((faq, index) => {
    if (!faq.question.trim()) {
      errors[`question-${index}`] = "سوال نمی‌تواند خالی باشد.";
    } else if (faq.question.length > 1000) {
      errors[`question-${index}`] = "سوال نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.";
    }
    if (!faq.answer.trim()) {
      errors[`answer-${index}`] = "پاسخ نمی‌تواند خالی باشد.";
    } else if (faq.answer.length > 3000) {
      errors[`answer-${index}`] = "پاسخ نمی‌تواند بیشتر از ۳۰۰۰ کاراکتر باشد.";
    }
  });
  return errors;
}

type ProductFAQSectionProps = {
  faqErrors: { [key: string]: string };
};

const ProductFAQSection: React.FC<ProductFAQSectionProps> = ({ faqErrors }) => {
  if (Object.keys(faqErrors).length === 0) return null;

  return (
    <div className="col-span-1 mb-4 mt-2 rounded-md bg-red-500 p-3 text-center sm:col-span-2">
      <p className="font-bold">خطاهای سوالات متداول:</p>
      <ul className="list-inside list-disc">
        {Object.entries(faqErrors).map(([key, error]) => (
          <li key={`faq-err-${key}`}>
            {key.includes("question") ? "سوال" : "پاسخ"} {parseInt(key.split("-")[1]) + 1}
            : {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductFAQSection;