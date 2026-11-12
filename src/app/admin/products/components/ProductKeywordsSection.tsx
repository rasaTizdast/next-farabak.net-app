import React from "react";

import { Product } from "../types";
import { InputChangeHandler } from "./ProductInputChange";

type ProductKeywordsSectionProps = {
  formState: Product;
  onChange: InputChangeHandler;
};

const ProductKeywordsSection: React.FC<ProductKeywordsSectionProps> = ({ formState, onChange }) => {
  const handleKeywordsChange = (name: string, value: string) => {
    const customEvent = { target: { name, value } };
    onChange(customEvent);
  };

  return (
    <div className="col-span-1 mb-4 block w-full sm:col-span-2">
      <label htmlFor="Description" className="mb-2 block">
        کلمات کلیدی
      </label>
      <input
        id="Description"
        type="text"
        onKeyDown={(e) => {
          const input = e.target as HTMLInputElement;
          if (e.key === "Enter" && input.value.trim()) {
            e.preventDefault();

            const newKeyword = input.value.trim();
            const updatedKeywords = formState.Description
              ? `${formState.Description} ${newKeyword}`
              : newKeyword;

            handleKeywordsChange("Description", updatedKeywords);
            input.value = "";
          }
        }}
        className="w-full rounded bg-gray-700 p-2 text-white"
        placeholder="کلمات کلیدی را تایپ کنید و Enter را فشار دهید"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {formState.Description &&
          formState.Description.split(" ").map((keyword: string, index: number) => (
            <button
              type="button"
              key={keyword}
              className="animate-fade-in flex items-center gap-2 rounded-lg bg-green-700 px-4 py-1 transition-colors hover:bg-red-700 hover:text-white"
              onClick={() => {
                const updatedKeywords = formState.Description.split(" ")
                  .filter((_: string, i: number) => i !== index)
                  .join(" ");

                handleKeywordsChange("Description", updatedKeywords);
              }}
            >
              {keyword}
            </button>
          ))}
      </div>
    </div>
  );
};

export default ProductKeywordsSection;
