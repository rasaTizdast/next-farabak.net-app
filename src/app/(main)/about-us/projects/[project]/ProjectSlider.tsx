"use client";

import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { RxDotFilled } from "react-icons/rx";

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

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  }, [slides.length]);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  // Autoplay logic
  useEffect(() => {
    if (isPaused) return; // Stop autoplay when paused

    const autoplay = setInterval(nextSlide, interval || 3000);

    return () => clearInterval(autoplay); // Clear interval on cleanup
  }, [isPaused, interval, nextSlide]);

  return (
    <div
      className="group relative m-auto h-auto max-h-[500px] w-full max-w-[calc(1900px-20rem)] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)} // Pause autoplay on hover
      onMouseLeave={() => setIsPaused(false)} // Resume autoplay on mouse leave
    >
      <div
        className="flex max-h-[500px] w-full transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(${currentIndex * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <Image
            key={slide.id}
            className="w-full flex-shrink-0 object-contain"
            src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${slide.img}`}
            alt={slide.alt}
            width={1920}
            height={900}
            quality={100}
          />
        ))}
      </div>
      {/* Left Arrow */}
      <div
        onClick={prevSlide}
        className="absolute left-5 top-[45.5%] hidden -translate-x-0 cursor-pointer rounded-full bg-black/30 p-2 text-2xl text-white group-hover:block"
      >
        <BsChevronCompactLeft size={30} />
      </div>
      {/* Right Arrow */}
      <div
        onClick={nextSlide}
        className="absolute right-5 top-[45.5%] hidden -translate-x-0 cursor-pointer rounded-full bg-black/30 p-2 text-2xl text-white group-hover:block"
      >
        <BsChevronCompactRight size={30} />
      </div>

      {/* Slider Pagination */}
      <div className="absolute left-[50%] flex -translate-x-[50%] -translate-y-10 justify-center gap-1 rounded-tl-2xl rounded-tr-2xl bg-[#f0f0f0] px-2 py-1">
        {slides.map((slide, slideIndex) => (
          <div
            className="cursor-pointer text-2xl"
            key={slideIndex}
            onClick={() => setCurrentIndex(slideIndex)}
          >
            <RxDotFilled
              size={33}
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

export default ProjectSlider;
