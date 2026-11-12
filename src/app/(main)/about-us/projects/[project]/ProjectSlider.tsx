"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { RxDotFilled } from "react-icons/rx";

import { PublicImage } from "@/components/public/PublicImage";

type Slider = {
  id: number;
  img: string;
  alt: string;
};

type ImageSliderProps = {
  slides: Slider[];
  interval?: number; // Optional prop for autoplay interval in milliseconds
};

const ProjectSlider = ({ slides, interval }: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    setCurrentIndex((current) => (slides.length > 0 ? Math.min(current, slides.length - 1) : 0));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  }, [slides.length]);

  const prevSlide = () => {
    if (slides.length <= 1) return;

    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    if (slides.length <= 1 || isPaused || prefersReducedMotion) return;

    const autoplay = setInterval(nextSlide, interval || 3000);

    return () => clearInterval(autoplay);
  }, [isPaused, interval, nextSlide, prefersReducedMotion, slides.length]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevSlide();
    }

    if (event.key === "Home") {
      event.preventDefault();
      setCurrentIndex(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      setCurrentIndex(Math.max(slides.length - 1, 0));
    }
  };

  if (slides.length === 0) {
    return (
      <div
        role="img"
        aria-label="تصویر پروژه موجود نیست"
        className="flex min-h-64 items-center justify-center rounded-3xl bg-slate-100 p-6 text-center text-sm leading-7 text-slate-500"
      >
        تصویر این پروژه در دسترس نیست.
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="گالری تصاویر پروژه"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="group relative m-auto h-auto max-h-[300px] w-full max-w-[1580px] overflow-hidden rounded-3xl bg-slate-950 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-4 focus-visible:outline-none md:max-h-[800px]"
      onMouseEnter={() => setIsPaused(true)} // Pause autoplay on hover
      onMouseLeave={() => setIsPaused(false)} // Resume autoplay on mouse leave
    >
      <div
        className="flex h-auto w-full transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <PublicImage
            key={slide.id}
            className="h-auto max-h-[300px] w-full shrink-0 object-contain md:max-h-[800px]"
            fallbackLabel="تصویر پروژه موجود نیست"
            src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${slide.img}`}
            alt={slide.alt}
            width={1920}
            height={900}
            quality={75}
          />
        ))}
      </div>
      {/* Left Arrow */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/60 p-2 text-2xl text-white transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:left-6"
        aria-label="اسلاید قبلی"
      >
        <BsChevronCompactLeft size={30} />
      </button>
      {/* Right Arrow */}
      <button
        type="button"
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/60 p-2 text-2xl text-white transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:right-6"
        aria-label="اسلاید بعدی"
      >
        <BsChevronCompactRight size={30} />
      </button>

      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 sm:inset-x-6">
        {slides.length > 1 ? (
          <button
            type="button"
            aria-label={isPaused ? "ادامه پخش خودکار" : "توقف پخش خودکار"}
            aria-pressed={isPaused}
            onClick={() => setIsPaused((paused) => !paused)}
            className="rounded-full bg-black/60 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            {isPaused ? "ادامه" : "توقف"}
          </button>
        ) : (
          <span aria-hidden="true" />
        )}

        <div className="flex justify-center gap-1 rounded-full bg-black/60 px-2 py-1">
          <span className="sr-only" aria-live="polite">
            اسلاید {currentIndex + 1} از {slides.length}
          </span>
          {slides.map((slide, slideIndex) => (
            <button
              type="button"
              className="rounded-full text-2xl leading-none focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              key={slideIndex}
              onClick={() => setCurrentIndex(slideIndex)}
              aria-label={`رفتن به اسلاید ${slideIndex + 1}`}
              aria-current={slideIndex === currentIndex ? "true" : undefined}
            >
              <RxDotFilled
                size={33}
                className={`transition-colors ${
                  slideIndex === currentIndex ? "text-white" : "text-slate-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectSlider;
