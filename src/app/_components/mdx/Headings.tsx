import React from "react";

interface HeadingProps {
  children: React.ReactNode;
}

export const H1: React.FC<HeadingProps> = ({ children }) => (
  <h1 className="mb-6 mt-3 text-lg font-bold leading-normal text-gray-900 mobile:text-2xl sm:text-4xl">
    {children}
  </h1>
);

export const H2: React.FC<HeadingProps> = ({ children }) => (
  <h2 className="mb-4 mt-3 text-lg font-semibold leading-normal text-gray-800 mobile:text-xl sm:text-3xl">
    {children}
  </h2>
);

export const H3: React.FC<HeadingProps> = ({ children }) => (
  <h3 className="my-3 text-lg font-semibold leading-normal text-gray-800 mobile:text-xl">
    {children}
  </h3>
);

export const H4: React.FC<HeadingProps> = ({ children }) => (
  <h4 className="my-3 text-sm font-semibold leading-normal text-gray-800 mobile:text-base sm:text-lg">
    {children}
  </h4>
);

export const H5: React.FC<HeadingProps> = ({ children }) => (
  <h5 className="my-3 text-xs font-semibold leading-normal text-gray-800 mobile:text-sm sm:text-base">
    {children}
  </h5>
);

export const H6: React.FC<HeadingProps> = ({ children }) => (
  <h6 className="my-3 text-xs font-semibold leading-normal text-gray-800 sm:text-sm">{children}</h6>
);
