"use client";

import { Button as AntButton, type ButtonProps as AntButtonProps } from "antd";

interface ButtonProps extends Omit<AntButtonProps, "size" | "variant"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
}

export function Button({ variant = "primary", size = "medium", ...props }: ButtonProps) {
  const antSize = size === "medium" ? "middle" : size;

  const variantMap = {
    primary: "primary",
    secondary: "default",
    danger: "primary",
    ghost: "text",
  } as const;

  return (
    <AntButton
      type={variantMap[variant]}
      size={antSize}
      danger={variant === "danger"}
      {...props}
    />
  );
}
