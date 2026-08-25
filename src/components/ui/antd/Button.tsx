"use client";
import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";

interface ButtonProps extends Omit<AntButtonProps, "variant" | "size"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
}

const variantMap = {
  primary: "primary",
  secondary: "default",
  danger: "primary",
  ghost: "text",
} as const;

export function Button({ variant = "primary", size = "medium", ...props }: ButtonProps) {
  const antSize = size === "medium" ? "middle" : size;
  return (
    <AntButton type={variantMap[variant]} size={antSize} danger={variant === "danger"} {...props} />
  );
}
