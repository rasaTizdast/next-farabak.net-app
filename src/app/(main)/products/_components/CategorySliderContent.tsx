"use client";

import { useRef, useState, useEffect } from "react";

import CategoryCard from "./CategoryCard";

interface CategorySliderContentProps {
  items: any[];
}

export default function CategorySliderContent({ items }: CategorySliderContentProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Check if document is RTL
    const htmlDir = document.documentElement.dir || document.documentElement.lang;
    setIsRTL(htmlDir === "rtl" || htmlDir?.startsWith("fa"));
    checkScroll();
  }, []);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;

      if (isRTL) {
        // For RTL: scrollLeft is negative, ranging from 0 to -(scrollWidth - clientWidth)
        const maxScroll = Math.abs(scrollWidth - clientWidth);
        const currentScroll = Math.abs(scrollLeft);
        setCanScrollLeft(currentScroll < maxScroll - 10); // Can scroll left (meaning scroll to more negative)
        setCanScrollRight(currentScroll > 10); // Can scroll right (back to 0)
      } else {
        // For LTR: standard behavior
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 400;

      if (isRTL) {
        // In RTL, scrollLeft is negative
        // "left" button means scroll more to the left (more negative)
        // "right" button means scroll back to right (less negative, towards 0)
        const newScrollLeft =
          direction === "left"
            ? sliderRef.current.scrollLeft - scrollAmount
            : sliderRef.current.scrollLeft + scrollAmount;

        sliderRef.current.scrollTo({
          left: newScrollLeft,
          behavior: "smooth",
        });
      } else {
        // Standard LTR behavior
        sliderRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }

      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative flex items-center gap-2 px-4 py-4 md:px-6 lg:px-8">
      {/* Right Button (Next in RTL) / Left Button (Previous in LTR) */}
      <button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className="absolute right-0 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-30 md:flex"
        aria-label={isRTL ? "بعدی" : "Scroll left"}
      >
        <svg
          className="h-5 w-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {/* Arrow pointing right for RTL (next), left for LTR (prev) */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
          />
        </svg>
      </button>

      {/* Slider Container */}
      <div
        ref={sliderRef}
        onScroll={checkScroll}
        onLoad={checkScroll}
        className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth md:gap-4"
        style={{
          scrollBehavior: "smooth",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        {items.map((item: any) => (
          <CategoryCard
            key={item.CategoryContentId}
            name={item.Name}
            slug={item.Slug}
            banner={item.Banner}
            link={item.Link || `#`}
            type={undefined}
          />
        ))}
      </div>

      {/* Left Button (Previous in RTL) / Right Button (Next in LTR) */}
      <button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className="absolute left-0 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-30 md:flex"
        aria-label={isRTL ? "قبلی" : "Scroll right"}
      >
        <svg
          className="h-5 w-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {/* Arrow pointing left for RTL (prev), right for LTR (next) */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
          />
        </svg>
      </button>

      {/* Add CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
