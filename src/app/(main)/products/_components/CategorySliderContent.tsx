"use client";

import { useRef, useState } from "react";

import CategoryCard from "./CategoryCard";

interface CategorySliderContentProps {
  items: any[];
}

export default function CategorySliderContent({ items }: CategorySliderContentProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(true);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;

      // For RTL: scrollLeft is negative, ranging from 0 to -(scrollWidth - clientWidth)
      const maxScroll = Math.abs(scrollWidth - clientWidth);
      const currentScroll = Math.abs(scrollLeft);
      setCanScrollLeft(currentScroll < maxScroll - 10); // Can scroll left (more cards)
      setCanScrollRight(currentScroll > 10); // Can scroll right (back)
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 400;

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

      setTimeout(checkScroll, 300);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    if (sliderRef.current) {
      setScrollStart(sliderRef.current.scrollLeft);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;

    const diff = e.clientX - dragStart;

    // In RTL, dragging right (positive diff) should scroll left (more negative)
    // Dragging left (negative diff) should scroll right (towards 0)
    sliderRef.current.scrollLeft = scrollStart - diff;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    checkScroll();
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex items-center gap-2 pb-10 md:gap-4">
      {/* Right Button (Previous in RTL) */}
      <button type="button"
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className="order-1 hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-30 mobile:flex"
        aria-label="قبلی"
      >
        <svg
          className="h-5 w-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {/* Arrow pointing right for RTL (previous) */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slider Container */}
      <div
        ref={sliderRef}
        onScroll={checkScroll}
        onLoad={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="scrollbar-hide order-2 flex cursor-grab gap-3 overflow-x-auto scroll-smooth active:cursor-grabbing md:gap-4"
        style={{
          scrollBehavior: isDragging ? "auto" : "smooth",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          direction: "rtl",
          userSelect: "none",
        }}
      >
        {items.map((item: any) => (
          <CategoryCard
            key={item.Slug}
            name={item.Name}
            slug={item.Slug}
            banner={item.Banner}
            link={item.Link || `#`}
            type={undefined}
          />
        ))}
      </div>

      {/* Left Button (Next in RTL) */}
      <button type="button"
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className="order-3 hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-30 mobile:flex"
        aria-label="بعدی"
      >
        <svg
          className="h-5 w-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {/* Arrow pointing left for RTL (next) */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
