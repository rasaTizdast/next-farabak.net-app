"use client";

import { useRef, useState, useEffect, useCallback } from "react";

import ProductCard, { type ProductCardData } from "@/app/(main)/products/_components/ProductCard";

type SliderProduct = {
  ProductId: number;
  Type: string;
  img1: string | null;
  link: string;
  Price: string | null;
  Discount: string | null;
};

type Props = {
  title: string;
  products: SliderProduct[];
  usdRate: number | null;
};

export default function SimilarProductsSlider({ title, products, usdRate }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);

  const isValidRate = usdRate && !isNaN(usdRate) && (usdRate as number) > 0;

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(280, el.clientWidth * 0.9);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const momentumScrollRef = useRef<() => void>(() => {});

  const momentumScroll = () => {
    if (!isDraggingRef.current && Math.abs(velocityRef.current) > 0.5) {
      const el = scrollerRef.current;
      if (!el) return;

      el.scrollLeft -= velocityRef.current;
      velocityRef.current *= 0.92;

      animationFrameRef.current = requestAnimationFrame(momentumScrollRef.current);
    } else {
      velocityRef.current = 0;
    }
  };

  useEffect(() => {
    momentumScrollRef.current = momentumScroll;
  }, []);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollerRef.current;
    if (!el) return;

    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    lastXRef.current = e.pageX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();

    const el = scrollerRef.current;
    if (!el) return;

    const currentTime = Date.now();
    const currentX = e.pageX;
    const deltaX = currentX - lastXRef.current;
    const deltaTime = currentTime - lastTimeRef.current;

    if (deltaTime > 0) {
      velocityRef.current = (deltaX / deltaTime) * 1000;
    }

    const x = e.pageX - el.offsetLeft;
    const walk = x - startXRef.current;
    el.scrollLeft = scrollLeftRef.current - walk;

    lastXRef.current = currentX;
    lastTimeRef.current = currentTime;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;

    const el = scrollerRef.current;
    if (!el) return;

    setIsDragging(false);
    el.style.cursor = "grab";
    el.style.userSelect = "auto";

    if (Math.abs(velocityRef.current) > 1) {
      momentumScroll();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const el = scrollerRef.current;
    if (!el) return;

    setIsDragging(true);
    startXRef.current = e.touches[0].pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    lastXRef.current = e.touches[0].pageX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();

    const el = scrollerRef.current;
    if (!el) return;

    const currentTime = Date.now();
    const currentX = e.touches[0].pageX;
    const deltaX = currentX - lastXRef.current;
    const deltaTime = currentTime - lastTimeRef.current;

    if (deltaTime > 0) {
      velocityRef.current = (deltaX / deltaTime) * 1000;
    }

    const x = e.touches[0].pageX - el.offsetLeft;
    const walk = x - startXRef.current;
    el.scrollLeft = scrollLeftRef.current - walk;

    lastXRef.current = currentX;
    lastTimeRef.current = currentTime;
  };

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;

    setIsDragging(false);

    if (Math.abs(velocityRef.current) > 1) {
      momentumScroll();
    }
  }, []);

  const handleMouseMoveRef = useRef(handleMouseMove);
  const handleMouseUpRef = useRef(handleMouseUp);
  const handleTouchMoveRef = useRef(handleTouchMove);
  useEffect(() => {
    handleMouseMoveRef.current = handleMouseMove;
    handleMouseUpRef.current = handleMouseUp;
    handleTouchMoveRef.current = handleTouchMove;
  });

  useEffect(() => {
    if (isDragging) {
      const onMove = (e: MouseEvent) => handleMouseMoveRef.current(e);
      const onUp = () => handleMouseUpRef.current();
      const onTouchMove = (e: TouchEvent) => handleTouchMoveRef.current(e);
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchEnd]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <section aria-labelledby="similar-products-heading" className="mt-12">
      <div className="flex items-center justify-between gap-4">
        <h2
          id="similar-products-heading"
          className="mb-6 text-start text-xl font-bold text-(--farabak-ink-deep) sm:text-2xl"
        >
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="قبلی"
            onClick={() => scrollBy(1)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-(--farabak-ink-deep)/15 bg-white text-(--farabak-ink-deep) shadow-sm hover:bg-(--farabak-paper) focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none"
          >
            <span className="inline-block">{"<"}</span>
          </button>
          <button
            type="button"
            aria-label="بعدی"
            onClick={() => scrollBy(-1)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-(--farabak-ink-deep)/15 bg-white text-(--farabak-ink-deep) shadow-sm hover:bg-(--farabak-paper) focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none"
          >
            <span>{">"}</span>
          </button>
        </div>
      </div>

      <div className="mt-2 mb-4 h-px w-full bg-gray-200" aria-hidden="true" />

      <div
        ref={scrollerRef}
        role="region"
        aria-label="لیست محصولات مشابه"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft")
            scrollerRef.current?.scrollBy({ left: -200, behavior: "smooth" });
          if (e.key === "ArrowRight")
            scrollerRef.current?.scrollBy({ left: 200, behavior: "smooth" });
        }}
        className="hide-scrollbar relative mt-2 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        style={{
          scrollBehavior: isDragging ? "auto" : "smooth",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {products.map((product) => (
          <div key={product.ProductId} className="w-65 shrink-0 snap-start">
            <ProductCard
              product={product as ProductCardData}
              usdRate={usdRate}
              isValidRate={Boolean(isValidRate)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
