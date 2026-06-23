"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useCallback, useEffect } from "react";

import styles from "@/app/(main)/products/_components/ProductGrid.module.css";

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
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastX, setLastX] = useState(0);
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

  // Smooth momentum scrolling
  const momentumScroll = useCallback(() => {
    if (!isDraggingRef.current && Math.abs(velocityRef.current) > 0.5) {
      const el = scrollerRef.current;
      if (!el) return;

      el.scrollLeft -= velocityRef.current;
      velocityRef.current *= 0.92;
      setVelocity(velocityRef.current);

      animationFrameRef.current = requestAnimationFrame(momentumScroll);
    } else {
      velocityRef.current = 0;
      setVelocity(0);
    }
  }, []);

  // Sync state to refs
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);
  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollerRef.current;
    if (!el) return;

    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    lastXRef.current = e.pageX;
    lastTimeRef.current = Date.now();
    setVelocity(0);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
    setLastX(e.pageX);
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();

    const el = scrollerRef.current;
    if (!el) return;

    const currentTime = Date.now();
    const currentX = e.pageX;
    const deltaX = currentX - lastXRef.current;
    const deltaTime = currentTime - lastTimeRef.current;

    if (deltaTime > 0) {
      setVelocity((deltaX / deltaTime) * 1000);
    }

    const x = e.pageX - el.offsetLeft;
    const walk = x - startXRef.current;
    el.scrollLeft = scrollLeftRef.current - walk;

    lastXRef.current = currentX;
    lastTimeRef.current = currentTime;
    setLastX(currentX);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;

    const el = scrollerRef.current;
    if (!el) return;

    setIsDragging(false);
    el.style.cursor = "grab";
    el.style.userSelect = "auto";

    if (Math.abs(velocityRef.current) > 1) {
      momentumScroll();
    }
  }, [momentumScroll]);

  // Touch drag handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = scrollerRef.current;
    if (!el) return;

    setIsDragging(true);
    startXRef.current = e.touches[0].pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    lastXRef.current = e.touches[0].pageX;
    lastTimeRef.current = Date.now();
    setStartX(e.touches[0].pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
    setLastX(e.touches[0].pageX);
    setVelocity(0);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();

    const el = scrollerRef.current;
    if (!el) return;

    const currentTime = Date.now();
    const currentX = e.touches[0].pageX;
    const deltaX = currentX - lastXRef.current;
    const deltaTime = currentTime - lastTimeRef.current;

    if (deltaTime > 0) {
      setVelocity((deltaX / deltaTime) * 1000);
    }

    const x = e.touches[0].pageX - el.offsetLeft;
    const walk = x - startXRef.current;
    el.scrollLeft = scrollLeftRef.current - walk;

    lastXRef.current = currentX;
    lastTimeRef.current = currentTime;
    setLastX(currentX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;

    setIsDragging(false);

    if (Math.abs(velocityRef.current) > 1) {
      momentumScroll();
    }
  }, [momentumScroll]);

  // Global event listeners for better performance
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Cleanup animation frame on unmount
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
      <div className="flex items-center justify-between">
        <h2 id="similar-products-heading" className={`${styles.gridTitle}`}>
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {/* In RTL, left arrow should scroll forward (positive) and right arrow backward */}
          <button
            type="button"
            aria-label="قبلی"
            onClick={() => scrollBy(1)}
            className="rounded-full border border-gray-300 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <span className="inline-block">{"<"}</span>
          </button>
          <button
            type="button"
            aria-label="بعدی"
            onClick={() => scrollBy(-1)}
            className="rounded-full border border-gray-300 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <span>{">"}</span>
          </button>
        </div>
      </div>

      {/* Full-width divider under the title */}
      <div className="mb-4 mt-2 h-px w-full bg-gray-200" aria-hidden="true" />

      <div
        ref={scrollerRef}
        className={`relative mt-2 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 ${styles.hideScrollbar}`}
        style={{
          scrollBehavior: isDragging ? "auto" : "smooth",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {products.map((product) => (
          <Link
            key={product.ProductId}
            href={`/products/${product.link}`}
            className={`${styles.productCard} shrink-0 snap-start`}
            style={{ width: 260 }}
          >
            <Image
              width={260}
              height={260}
              quality={100}
              src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/productImages/${product.img1 ?? ""}`}
              alt={product.Type}
              loading="lazy"
              className="w-full"
            />
            <h2>{product.Type}</h2>
            <div className="mt-3 font-extralight">
              {product.Price === null || product.Price === undefined || +product.Price === 0 ? (
                <span className="text-gray-600">برای ثبت سفارش با بخش فروش تماس بگیرید</span>
              ) : !isValidRate ? (
                <span className="font-medium text-gray-600">برای دریافت قیمت تماس بگیرید</span>
              ) : product.Discount && +product.Discount > 0 ? (
                <div className="flex flex-col items-center gap-1 text-lg">
                  <span className="font-light text-gray-500 line-through">
                    {(+product.Price * (usdRate as number)).toLocaleString("fa-IR") + " تومان"}
                  </span>
                  <span className="font-semibold">
                    {((+product.Price - +product.Discount) * (usdRate as number)).toLocaleString(
                      "fa-IR"
                    ) + " تومان"}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-semibold text-white">
                  {(+product.Price * (usdRate as number)).toLocaleString("fa-IR") + " تومان"}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
