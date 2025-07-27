"use client";

import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppContactButtonProps {
  phoneNumber: string;
  initialMessage?: string;
}

const WhatsAppContactButton = ({
  phoneNumber = "989123456789", // Default phone number
  initialMessage = "سلام، من از وبسایت فرابک با شما در تماس هستم.", // Default message
}: WhatsAppContactButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 576);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const openWhatsApp = () => {
    // Remove any non-numeric characters from the phone number
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    // Create the WhatsApp URL with the encoded message
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
      initialMessage
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 flex items-center rounded-full shadow-md transition-all duration-500 ease-in-out cursor-pointer translate-x-0
        ${isHovered && !isMobile ? "bg-green-600" : "bg-green-500"}
      `}
      onClick={openWhatsApp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Contact support via WhatsApp"
    >
      <div
        className={`text-white overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap
          ${
            isHovered && !isMobile
              ? "max-w-32 opacity-100 pr-4"
              : "max-w-0 opacity-0 px-0"
          }
        `}
      >
        پیام به پشتیبانی
      </div>
      <div className="p-3">
        <FaWhatsapp className="w-5 h-5 text-white" />
      </div>
    </div>
  );
};

export default WhatsAppContactButton;
