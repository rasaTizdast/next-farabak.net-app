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
        className={`bg-gray-800 text-white rounded-lg shadow-xl p-6 w-full ${sizeClasses} max-h-[90vh] overflow-auto relative animate-fade-in ${className}`}
      >
        {title && (
          <h2 className="text-xl font-bold mb-6 text-center">{title}</h2>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 font-bold text-gray-400 hover:text-gray-200 focus:outline-none"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;
