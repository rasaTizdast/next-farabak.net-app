"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { RxDotFilled } from "react-icons/rx";

type Slider = {
  id: number;
  img: string;
  link: string;
  alt: string;
};

type ImageSliderProps = {
  slides: Slider[];
  interval?: number;
};

const ImageSlider = ({ slides, interval }: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [_isPaused, setIsPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>(() => Array(slides.length).fill(false));

  if (imageLoaded.length !== slides.length) {
    setImageLoaded(Array(slides.length).fill(false));
  }

  const handleImageLoad = (index: number) => {
    setImageLoaded((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  }, [slides.length]);

  const nextSlideRef = useRef(nextSlide);
  useEffect(() => {
    nextSlideRef.current = nextSlide;
  }, [nextSlide]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  useEffect(() => {
    if (_isPaused) return;

    const autoplay = setInterval(() => {
      nextSlideRef.current();
    }, interval || 5000);

    return () => clearInterval(autoplay);
  }, [interval, _isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      className="w-full px-6 py-8 min-[576px]:px-12 min-[992px]:px-20 min-[1200px]:px-24 md:px-16 2xl:px-40"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="group relative mx-auto max-w-[1580px] overflow-hidden rounded-[20px]">
        <div className="relative aspect-1920/900 w-full">
          <div
            className="absolute inset-0 flex w-full transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(${currentIndex * 100}%)`,
            }}
          >
            {slides.map((slide, index) => (
              <Link
                href={slide.link}
                prefetch={false}
                key={slide.id}
                className="relative size-full shrink-0"
              >
                {!imageLoaded[index] && index !== 0 && (
                  <div className="absolute inset-0 bg-gray-100" />
                )}

                <Image
                  className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
                    index === 0 || imageLoaded[index] ? "opacity-100" : "opacity-0"
                  }`}
                  src={slide.img}
                  alt={slide.alt}
                  width={1920}
                  height={900}
                  quality={75}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  onLoad={() => handleImageLoad(index)}
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute top-1/2 left-4 hidden -translate-y-1/2 cursor-pointer rounded-full bg-black/30 p-2 text-2xl text-white group-hover:block md:block"
            aria-label="اسلاید بعدی"
          >
            <BsChevronCompactLeft size={30} />
          </button>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute top-1/2 right-4 hidden -translate-y-1/2 cursor-pointer rounded-full bg-black/30 p-2 text-2xl text-white group-hover:block md:block"
            aria-label="اسلاید قبلی"
          >
            <BsChevronCompactRight size={30} />
          </button>

          <div className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 gap-1 rounded-t-2xl bg-[#f0f0f0] px-2 py-1 sm:flex sm:gap-2">
            {slides.map((_, slideIndex) => (
              <button
                type="button"
                className="cursor-pointer text-xl md:text-2xl"
                key={slideIndex}
                onClick={() => setCurrentIndex(slideIndex)}
                aria-label={`اسلاید ${slideIndex + 1}`}
              >
                <RxDotFilled
                  className={`transition-colors ${
                    slideIndex === currentIndex ? "text-[#000000]" : "text-[#0e8bff]"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
