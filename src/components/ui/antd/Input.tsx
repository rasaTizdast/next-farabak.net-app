"use client";
import { Input as AntInput, InputProps } from "antd";

export function Input(props: InputProps) {
  return <AntInput size="middle" {...props} />;
}
