"use client";

import { Input } from "antd";
import { Search } from "lucide-react";
import { useState } from "react";

import { Accordion } from "@/components/ui/ItemsAccordion";
import "./faq.css";

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
  const [searchQuery, setSearchQuery] = useState("");

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
        <Accordion<FaqItem>
          allowMultiple={false}
          items={filteredFaqs.map((faq) => ({
            id: String(faq.FaqDetailsid),
            data: faq,
            renderHeader: (item) => (
              <h2 className="pr-1 text-right text-sm font-medium text-gray-900 md:pr-2 md:text-base">
                {item.Q || "سوال بدون عنوان"}
              </h2>
            ),
            renderContent: (item) => (
              <p className="text-xs leading-relaxed text-gray-700 md:text-sm">
                {item.A || "پاسخی ثبت نشده است."}
              </p>
            ),
          }))}
        />
      )}
    </div>
  );
};

export default FaqAccordion;
