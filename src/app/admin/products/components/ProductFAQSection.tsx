type ProductFAQSectionProps = {
  faqErrors: { [key: string]: string };
};

const ProductFAQSection: React.FC<ProductFAQSectionProps> = ({ faqErrors }) => {
  if (Object.keys(faqErrors).length === 0) return null;

  return (
    <div className="col-span-1 mt-2 mb-4 rounded-md bg-red-500 p-3 text-center sm:col-span-2">
      <p className="font-bold">خطاهای سوالات متداول:</p>
      <ul className="list-inside list-disc">
        {Object.entries(faqErrors).map(([key, error]) => (
          <li key={`faq-err-${key}`}>
            {key.includes("question") ? "سوال" : "پاسخ"} {parseInt(key.split("-")[1]) + 1}: {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductFAQSection;
