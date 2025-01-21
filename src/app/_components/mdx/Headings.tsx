import React from "react";

interface HeadingProps {
  children: React.ReactNode;
}

export const H1: React.FC<HeadingProps> = ({ children }) => (
  <h1 className="text-lg mobile:text-2xl sm:text-4xl font-bold text-gray-900 mt-3 mb-6 leading-normal">
    {children}
  </h1>
);

export const H2: React.FC<HeadingProps> = ({ children }) => (
  <h2 className="text-lg mobile:text-xl sm:text-3xl font-semibold text-gray-800 mt-3 mb-6 leading-normal">
    {children}
  </h2>
);

export const H3: React.FC<HeadingProps> = ({ children }) => (
  <h3 className="text-lg mobile:text-xl font-semibold text-gray-800 mt-3 mb-6 leading-normal">
    {children}
  </h3>
);

export const H4: React.FC<HeadingProps> = ({ children }) => (
  <h4 className="text-sm mobile:text-base sm:text-lg font-semibold text-gray-800 mt-3 mb-6 leading-normal">
    {children}
  </h4>
);

export const H5: React.FC<HeadingProps> = ({ children }) => (
  <h5 className="text-xs mobile:text-sm sm:text-base font-semibold text-gray-800 mt-3 mb-6 leading-normal">
    {children}
  </h5>
);

export const H6: React.FC<HeadingProps> = ({ children }) => (
  <h6 className="text-xs sm:text-sm font-semibold text-gray-800 mt-3 mb-6 leading-normal">
    {children}
  </h6>
);
