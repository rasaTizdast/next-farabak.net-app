import React, { ReactNode } from "react";
import { IoIosClose } from "react-icons/io";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  showCloseButton?: boolean;
  preventOutsideClick?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  zIndex?: number;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = "",
  showCloseButton = true,
  preventOutsideClick = false,
  size = "lg",
  zIndex = 50,
}) => {
  // Don't render if not open
  if (!isOpen) return null;

  // Map size to width classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-6xl",
  }[size];

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity`}
      style={{ zIndex }}
    >
      <div
        className={`bg-gray-800 text-white rounded-lg shadow-xl p-6 w-full ${sizeClasses} max-h-[90vh] overflow-auto relative animate-fade-in ${className}`}
      >
        {title && (
          <h2 className="text-xl font-bold mb-6 text-center">{title}</h2>
        )}

        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-red-400 hover:text-red-500 transition-colors"
            aria-label="Close"
          >
            <IoIosClose size={30} />
          </button>
        )}

        {children}
      </div>
    </div>
  );
};

export default Modal;
