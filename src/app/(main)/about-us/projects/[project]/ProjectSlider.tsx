"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

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

  const nextSlide = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  // Autoplay logic
  useEffect(() => {
    if (isPaused) return; // Stop autoplay when paused

    const autoplay = setInterval(() => {
      nextSlide();
    }, interval || 3000);

    return () => clearInterval(autoplay); // Clear interval on cleanup
  }, [currentIndex, isPaused, interval]);

  return (
    <div
      className="max-w-[calc(1900px-20rem)] h-auto max-h-[500px] w-full m-auto relative group overflow-hidden"
      onMouseEnter={() => setIsPaused(true)} // Pause autoplay on hover
      onMouseLeave={() => setIsPaused(false)} // Resume autoplay on mouse leave
    >
      <div
        className="flex transition-transform duration-700 ease-in-out max-h-[500px] w-full"
        style={{
          transform: `translateX(${currentIndex * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <Image
            key={slide.id}
            className="w-full flex-shrink-0 object-contain"
            src={slide.img}
            alt={slide.alt}
            width={1920}
            height={900}
            quality={100}
          />
        ))}
      </div>
      {/* Left Arrow */}
      <div
        onClick={nextSlide}
        className="hidden group-hover:block absolute top-[45.5%] -translate-x-0 left-5 text-2xl rounded-full p-2 bg-black/30 text-white cursor-pointer"
      >
        <BsChevronCompactLeft size={30} />
      </div>
      {/* Right Arrow */}
      <div
        onClick={prevSlide}
        className="hidden group-hover:block absolute top-[45.5%] -translate-x-0 right-5 text-2xl rounded-full p-2 bg-black/30 text-white cursor-pointer"
      >
        <BsChevronCompactRight size={30} />
      </div>

      {/* Slider Pagination */}
      <div className="flex justify-center py-1 px-2 gap-1 absolute left-[50%] -translate-x-[50%] -translate-y-10 bg-[#f0f0f0] rounded-tl-2xl rounded-tr-2xl">
        {slides.map((slide, slideIndex) => (
          <div
            className="text-2xl cursor-pointer"
            key={slideIndex}
            onClick={() => setCurrentIndex(slideIndex)}
          >
            <RxDotFilled
              size={33}
              className={`transition-all ${
                slideIndex === currentIndex
                  ? "text-[#000000]"
                  : "text-[#0e8bff]"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectSlider;
