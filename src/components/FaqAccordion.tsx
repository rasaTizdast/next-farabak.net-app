"use client";

import { Input } from "antd";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState } from "react";
import "./faq.css"; // This will be created next

export interface FaqItem {
  FaqDetailsid: number;
  Q?: string | null;
  A?: string | null;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
  className?: string;
}

const FaqAccordion = ({ faqs, className = "" }: FaqAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.Q?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.A?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!faqs || faqs.length === 0) {
    return (
      <div className="px-4 py-6 text-center md:py-10">
        <div className="mx-auto max-w-lg rounded-xl border border-blue-100 bg-gradient-to-br from-blue-100 to-blue-50 p-4 shadow-md md:p-6">
          <h3 className="mb-2 text-lg font-bold text-blue-900 md:text-xl">
            متأسفانه در حال حاضر پرسش و پاسخی موجود نیست.
          </h3>
          <p className="text-sm text-blue-700 md:text-base">
            لطفاً بعداً مراجعه کنید یا با پشتیبانی تماس بگیرید.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto w-full max-w-3xl ${className}`}>
      <div className="relative mb-6 md:mb-8">
        <div className="faq-search-container relative">
          <Input
            placeholder="جستجو در سوالات متداول..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="faq-search-input rounded-lg border border-gray-200 px-2 py-1.5 text-right text-sm shadow-sm hover:border-gray-300 focus:border-blue-500 md:px-4 md:py-2.5 md:text-base"
            style={{ fontFamily: "inherit" }}
            prefix={<Search className="mr-1 h-3.5 w-3.5 text-blue-500 md:h-4 md:w-4" />}
            allowClear
          />
          <div className="absolute -bottom-2 left-1/2 h-0.5 w-12 -translate-x-1/2 transform rounded-full bg-blue-500 md:-bottom-4 md:w-16"></div>
        </div>
      </div>

      {filteredFaqs.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-6 text-center shadow-inner md:py-8">
          <Search className="mx-auto mb-2 h-6 w-6 text-gray-400 opacity-50 md:h-8 md:w-8" />
          <p className="text-sm text-gray-600 md:text-base">
            هیچ نتیجه‌ای برای جستجوی شما یافت نشد.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.FaqDetailsid}
                className={`overflow-hidden rounded-lg border bg-white ${
                  isOpen
                    ? "border-blue-300 shadow-md shadow-blue-50"
                    : "border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md"
                } transition-all duration-300`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className={`flex w-full items-center justify-between p-3 text-right focus:outline-none md:p-4 ${
                    isOpen ? "bg-blue-50" : "hover:bg-gray-50"
                  } transition-colors duration-300`}
                  aria-expanded={isOpen}
                >
                  <h2
                    className={`text-sm font-medium md:text-base ${
                      isOpen ? "text-blue-800" : "text-gray-900"
                    } pr-1 text-right transition-colors duration-300 md:pr-2`}
                  >
                    {faq.Q || "سوال بدون عنوان"}
                  </h2>
                  <span
                    className={`ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full md:ml-4 md:h-7 md:w-7 ${
                      isOpen ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                    } transition-all duration-300`}
                  >
                    {isOpen ? (
                      <ChevronUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 pt-0 md:px-4 md:pb-4">
                    <h3 className="border-t border-blue-50 pt-2 text-xs leading-relaxed text-gray-700 md:pt-3 md:text-sm">
                      {faq.A || "پاسخی ثبت نشده است."}
                    </h3>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FaqAccordion;
