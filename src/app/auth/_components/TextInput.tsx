"use client";

import { useState } from "react";
import {
  Controller,
  useFormContext,
  FieldValues,
  Control,
  FieldErrors,
  Path,
} from "react-hook-form";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

// Define Prop types
type Props<T extends FieldValues> = {
  name: keyof T;
  label: string;
  placeholder: string;
  control: Control<T>;
  errors: FieldErrors<T>;
  rules?: object;
  autoComplete?: string;
  type?: "text" | "password" | "email" | "tel";
};

const TextInput = <T extends FieldValues>({
  name,
  label,
  placeholder,
  control,
  errors,
  rules,
  autoComplete = "off",
  type = "text",
  ...rest
}: Props<T>) => {
  const { watch } = useFormContext();
  const value = watch(name as string);
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const hasError = !!errors[name];
  const hasValue = !!value;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={String(name)} className="text-base font-bold">
        {label}
      </label>
      <div className="relative">
        <Controller
          name={name as Path<T>}
          control={control}
          rules={rules}
          render={({ field }) => (
            <input
              autoComplete={autoComplete}
              {...field}
              type={type === "password" && showPassword ? "text" : type}
              id={String(name)}
              placeholder={placeholder}
              value={value ?? ""}
              className={`w-full rounded-lg border border-[#c7c7c7] p-[14px] text-start text-[14px] font-medium transition-colors duration-300 outline-none ${
                hasError
                  ? "border-2 border-[#e74c3c] text-[#e74c3c] placeholder:font-light placeholder:text-[#e74c3c]"
                  : hasValue
                    ? "border-2 border-[#2ecc71] text-[#03af4b]"
                    : ""
              }`}
              {...rest}
            />
          )}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute inset-s-[15px] top-1/2 -translate-y-1/2 cursor-pointer text-[1.2rem] text-gray-500"
            onClick={handleTogglePassword}
            aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
          >
            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
          </button>
        )}
      </div>
      {hasError && (
        <p className="mt-1 text-[0.875rem] text-[#e74c3c]">{errors[name]?.message as string}</p>
      )}
    </div>
  );
};

export default TextInput;
