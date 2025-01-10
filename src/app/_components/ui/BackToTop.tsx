"use client";

import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const BackToTop = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.75;
      setShowBackToTop(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 flex items-center rounded-full shadow-md transition-all duration-500 ease-in-out cursor-pointer
        ${showBackToTop ? "translate-x-0" : "-translate-x-[200%]"}
        ${isHovered ? "bg-blue-600" : "bg-blue-500"}
      `}
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Scroll to top"
    >
      <div
        className={`text-white overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap
          ${isHovered ? "max-w-32 opacity-100 pr-4" : "max-w-0 opacity-0 px-0"}
        `}
      >
        بازگشت به بالا
      </div>
      <div className="p-3">
        <FaArrowUp className="w-5 h-5 text-white" />
      </div>
    </div>
  );
};

export default BackToTop;
