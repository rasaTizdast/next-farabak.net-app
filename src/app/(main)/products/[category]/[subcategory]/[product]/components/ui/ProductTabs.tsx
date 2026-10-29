"use client";

import { useEffect, useRef, useState } from "react";

const HEADER_GAP = 12;

const tabs = [
  { id: "overview", label: "توضیحات" },
  { id: "blog", label: "توضیحات تکمیلی" },
  { id: "specs", label: "مشخصات" },
  { id: "faq", label: "سوالات" },
] as const;
type ProductTab = (typeof tabs)[number];

const ProductTabs = () => {
  const navRef = useRef<HTMLElement | null>(null);
  const [stickyTop, setStickyTop] = useState<number | null>(null);
  const [visibleTabs, setVisibleTabs] = useState<ProductTab[]>([...tabs]);

  useEffect(() => {
    const updateVisibleTabs = () => {
      setVisibleTabs(
        tabs.filter((tab) => document.querySelector(`#${tab.id} [data-product-section-content]`))
      );
    };

    updateVisibleTabs();
    const observer = new MutationObserver(updateVisibleTabs);
    observer.observe(document.getElementById("main-content") ?? document.body, {
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    const measureHeader = () => setStickyTop(header.offsetHeight + HEADER_GAP);
    measureHeader();
    const observer = new ResizeObserver(measureHeader);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const headerHeight = document.querySelector("header")?.offsetHeight ?? 0;
    const navHeight = navRef.current?.offsetHeight ?? 0;
    const yOffset = -(headerHeight + HEADER_GAP + navHeight + 8);
    const yPosition = element.getBoundingClientRect().top + window.scrollY + yOffset;

    window.scrollTo({ top: yPosition, behavior: "smooth" });
  };

  if (visibleTabs.length === 0) return null;

  return (
    <nav
      ref={navRef}
      aria-label="بخش‌های محصول"
      style={stickyTop !== null ? { top: `${stickyTop}px` } : undefined}
      className="sticky z-5 mx-auto my-8 w-full overflow-x-auto rounded-xl border border-(--farabak-ink-deep)/10 bg-(--farabak-ink-deep) shadow-[0_12px_30px_rgba(6,26,48,0.14)]"
    >
      <ul className="flex min-w-max items-center justify-center gap-1 p-1 sm:gap-2">
        {visibleTabs.map((tab) => (
          <li key={tab.id}>
            <a
              href={`#${tab.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(tab.id);
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:ring-offset-(--farabak-ink-deep) focus-visible:outline-none sm:px-5"
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ProductTabs;
