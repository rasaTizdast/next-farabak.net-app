"use client";

import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const BackToTop = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.75;
      setShowBackToTop(window.scrollY > threshold);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 576);
    };

    // Initial checks
    handleResize();
    handleScroll();

    // Add event listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      className={`fixed bottom-[4.5rem] left-4 z-50 flex cursor-pointer items-center rounded-full shadow-md transition-all duration-500 ease-in-out ${showBackToTop ? "translate-x-0" : "-translate-x-[200%]"} ${isHovered && !isMobile ? "bg-blue-600" : "bg-blue-500"} `}
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="بازگشت به بالا"
    >
      <span
        className={`overflow-hidden whitespace-nowrap text-white transition-all duration-500 ease-in-out ${
          isHovered && !isMobile ? "max-w-32 pr-4 opacity-100" : "max-w-0 px-0 opacity-0"
        } `}
      >
        بازگشت به بالا
      </span>
      <span className="p-3">
        <FaArrowUp className="h-5 w-5 text-white" />
      </span>
    </button>
  );
};

export default BackToTop;
