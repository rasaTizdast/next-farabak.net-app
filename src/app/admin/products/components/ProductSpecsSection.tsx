import React from "react";

import { Product, Specs } from "../types";
import EditModalFAQ from "./EditModalFAQ";
import EditModalSpecs from "./EditModalSpecs";
import ProductFAQSection from "./ProductFAQSection";
import { FAQItem } from "./ProductValidation";

type ProductSpecsSectionProps = {
  formState: Product;
  specs: Specs | null;
  setSpecs: React.Dispatch<React.SetStateAction<Specs | null>>;
  setFaqs: (faqs: FAQItem[]) => void;
  faqErrors: { [key: string]: string };
};

const ProductSpecsSection: React.FC<ProductSpecsSectionProps> = ({
  formState,
  specs,
  setSpecs,
  setFaqs,
  faqErrors,
}) => {
  return (
    <>
      <EditModalSpecs
        productId={formState.ProductId}
        productName={formState.Name}
        specs={specs}
        setSpecs={setSpecs}
      />

      <EditModalFAQ productId={formState.ProductId} setFaqs={setFaqs} />

      <ProductFAQSection faqErrors={faqErrors} />
    </>
  );
};

export default ProductSpecsSection;
