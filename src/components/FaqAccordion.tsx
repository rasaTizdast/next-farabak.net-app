"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "antd";
import './faq.css'; // This will be created next

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
      <div className="text-center py-6 md:py-10 px-4">
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 md:p-6 max-w-lg mx-auto shadow-md border border-blue-100">
          <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-2">
            متأسفانه در حال حاضر پرسش و پاسخی موجود نیست.
          </h3>
          <p className="text-sm md:text-base text-blue-700">
            لطفاً بعداً مراجعه کنید یا با پشتیبانی تماس بگیرید.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <div className="mb-6 md:mb-8 relative">
        <div className="relative faq-search-container">
          <Input
            placeholder="جستجو در سوالات متداول..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="faq-search-input py-1.5 md:py-2.5 px-2 md:px-4 text-right rounded-lg border border-gray-200 focus:border-blue-500 hover:border-gray-300 shadow-sm text-sm md:text-base"
            style={{ fontFamily: 'inherit' }}
            prefix={
              <Search className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500 mr-1" />
            }
            allowClear
          />
          <div className="absolute -bottom-2 md:-bottom-4 left-1/2 w-12 md:w-16 h-0.5 bg-blue-500 rounded-full transform -translate-x-1/2"></div>
        </div>
      </div>

      {filteredFaqs.length === 0 ? (
        <div className="text-center py-6 md:py-8 bg-gray-50 rounded-lg shadow-inner">
          <Search className="h-6 w-6 md:h-8 md:w-8 text-gray-400 mx-auto mb-2 opacity-50" />
          <p className="text-gray-600 text-sm md:text-base">
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
                className={`border rounded-lg overflow-hidden bg-white ${
                  isOpen
                    ? "border-blue-300 shadow-md shadow-blue-50"
                    : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
                } transition-all duration-300`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className={`flex justify-between items-center w-full p-3 md:p-4 text-right focus:outline-none ${
                    isOpen ? "bg-blue-50" : "hover:bg-gray-50"
                  } transition-colors duration-300`}
                  aria-expanded={isOpen}
                >
                  <h2
                    className={`text-sm md:text-base font-medium ${
                      isOpen ? "text-blue-800" : "text-gray-900"
                    } text-right transition-colors duration-300 pr-1 md:pr-2`}
                  >
                    {faq.Q || "سوال بدون عنوان"}
                  </h2>
                  <span
                    className={`ml-2 md:ml-4 flex-shrink-0 flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full ${
                      isOpen
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-500"
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
                  <div className="px-3 md:px-4 pb-3 md:pb-4 pt-0">
                    <h3 className="border-t border-blue-50 pt-2 md:pt-3 text-xs md:text-sm text-gray-700 leading-relaxed">
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
