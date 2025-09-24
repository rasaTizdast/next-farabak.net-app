import React, { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  zIndex?: number;
}

const Modal: React.FC<Props> = ({
  isOpen,
  onClose,
  children,
  title,
  className = "",
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
        className={`w-full rounded-lg bg-gray-800 p-6 text-white shadow-xl ${sizeClasses} relative max-h-[90vh] animate-fade-in overflow-auto ${className}`}
      >
        {title && <h2 className="mb-6 text-center text-xl font-bold">{title}</h2>}

        <button
          onClick={onClose}
          className="absolute right-4 top-4 font-bold text-gray-400 hover:text-gray-200 focus:outline-none"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;
