import React from "react";

interface SwaggerLayoutProps {
  children: React.ReactNode;
}

const SwaggerLayout: React.FC<SwaggerLayoutProps> = ({ children }) => {
  return <div dir="ltr">{children}</div>;
};

export default SwaggerLayout;
