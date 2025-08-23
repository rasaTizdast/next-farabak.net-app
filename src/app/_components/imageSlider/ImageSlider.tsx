"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
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
  interval?: number; // Optional prop for autoplay interval in milliseconds
};

const ImageSlider = ({ slides, interval }: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([]);

  useEffect(() => {
    // Initialize the loading state for each image
    setImageLoaded(Array(slides.length).fill(false));
  }, [slides]);

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

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  }, [slides.length]);

  // Autoplay logic
  useEffect(() => {
    if (isPaused) return; // Stop autoplay when paused

    const autoplay = setInterval(() => {
      nextSlide();
    }, interval || 3000);

    return () => clearInterval(autoplay); // Clear interval on cleanup
  }, [isPaused, interval, nextSlide]);

  return (
    <div
      className="group relative m-auto h-auto max-h-[calc(100vh-64px)] w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)} // Pause autoplay on hover
      onMouseLeave={() => setIsPaused(false)} // Resume autoplay on mouse leave
    >
      <div
        className="flex w-full transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(${currentIndex * 100}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <Link href={slide.link} key={slide.id} className="relative w-full flex-shrink-0">
            {/* Skeleton Loader */}
            {!imageLoaded[index] && (
              <div className="absolute inset-0 animate-pulse bg-gray-400"></div>
            )}

            {/* Image */}
            <Image
              className={`w-full transition-all duration-500 ${
                imageLoaded[index] ? "opacity-100" : "opacity-0"
              }`}
              src={slide.img}
              alt={slide.alt}
              width={1920}
              height={900}
              quality={100}
              onLoad={() => handleImageLoad(index)}
            />
          </Link>
        ))}
      </div>
      {/* Left Arrow */}
      <div
        onClick={nextSlide}
        className="absolute left-5 top-[45.5%] hidden -translate-x-0 cursor-pointer rounded-full bg-black/30 p-2 text-2xl text-white group-hover:block"
      >
        <BsChevronCompactLeft size={30} />
      </div>
      {/* Right Arrow */}
      <div
        onClick={prevSlide}
        className="absolute right-5 top-[45.5%] hidden -translate-x-0 cursor-pointer rounded-full bg-black/30 p-2 text-2xl text-white group-hover:block"
      >
        <BsChevronCompactRight size={30} />
      </div>

      {/* Slider Pagination */}
      <div className="xl absolute bottom-0 left-[50%] hidden -translate-x-[50%] justify-center gap-1 rounded-tl-2xl rounded-tr-2xl bg-[#f0f0f0] px-2 py-1 sm:flex">
        {slides.map((_, slideIndex) => (
          <div
            className="cursor-pointer text-xl md:text-2xl lg:text-3xl"
            key={slideIndex}
            onClick={() => setCurrentIndex(slideIndex)}
          >
            <RxDotFilled
              className={`transition-all ${
                slideIndex === currentIndex ? "text-[#000000]" : "text-[#0e8bff]"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
