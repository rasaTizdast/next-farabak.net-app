"use client";

import { useEffect, useRef, useState } from "react";

const HEADER_GAP = 12;

const ProductTabs = () => {
  const navRef = useRef<HTMLElement | null>(null);
  const [stickyTop, setStickyTop] = useState<number | null>(null);

  useEffect(() => {
    const header = document.querySelector("header");

    if (!header) return;

    const measureHeader = () => {
      setStickyTop(header.offsetHeight + HEADER_GAP);
    };

    measureHeader();

    const observer = new ResizeObserver(measureHeader);
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  // Scroll function with offset
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    const headerHeight = document.querySelector("header")?.offsetHeight ?? 0;
    const navHeight = navRef.current?.offsetHeight ?? 0;

    if (element) {
      const yOffset = -(headerHeight + HEADER_GAP + navHeight + 8);
      const yPosition = element.getBoundingClientRect().top + window.scrollY + yOffset;

      window.scrollTo({
        top: yPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      ref={navRef}
      style={stickyTop !== null ? { top: `${stickyTop}px` } : undefined}
      className="sticky top-[100px] z-5 mx-auto my-8 flex w-full items-center justify-center rounded-[5px] bg-[#2774c0] text-center text-white shadow-[0_4px_10px_4px_rgba(0,0,0,0.2)]"
    >
      <ul className="flex w-[80%] list-none items-center justify-evenly max-[576px]:w-full">
        <li className="cursor-pointer px-2 py-[0.8rem] text-[clamp(0.8rem,1.7vw,1rem)] transition-colors duration-200 max-[400px]:text-[0.7rem]">
          <button
            type="button"
            className="cursor-pointer text-white transition-colors"
            onClick={() => scrollToSection("overview")}
          >
            توضیحات
          </button>
        </li>
        <li className="cursor-pointer px-2 py-[0.8rem] text-[clamp(0.8rem,1.7vw,1rem)] transition-colors duration-200 max-[400px]:text-[0.7rem]">
          <button
            type="button"
            className="cursor-pointer text-white transition-colors"
            onClick={() => scrollToSection("blog")}
          >
            توضیحات تکمیلی
          </button>
        </li>
        <li className="cursor-pointer px-2 py-[0.8rem] text-[clamp(0.8rem,1.7vw,1rem)] transition-colors duration-200 max-[400px]:text-[0.7rem]">
          <button
            type="button"
            className="cursor-pointer text-white transition-colors"
            onClick={() => scrollToSection("specs")}
          >
            مشخصات
          </button>
        </li>
        <li className="cursor-pointer px-2 py-[0.8rem] text-[clamp(0.8rem,1.7vw,1rem)] transition-colors duration-200 max-[400px]:text-[0.7rem]">
          <button
            type="button"
            className="cursor-pointer text-white transition-colors"
            onClick={() => scrollToSection("faq")}
          >
            سوالات
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default ProductTabs;
