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

import styles from "./TextInput.module.css";

// Define Prop types
type Props<T extends FieldValues> = {
  name: keyof T;
  label: string;
  placeholder: string;
  control: Control<T>; // Control is now typed with T, the form data type
  errors: FieldErrors<T>; // FieldErrors is typed with T to correctly reference the structure of form errors
  rules?: object; // Optional rules, these can be made more strict based on your form schema
  autoComplete?: string; // Optional autocomplete value
  type?: "text" | "password" | "email" | "tel"; // Specify only allowed types
};

const TextInput = <T extends FieldValues>({
  name,
  label,
  placeholder,
  control,
  errors,
  rules,
  autoComplete = "off", // Default value for autoComplete
  type = "text", // Default value for type
  ...rest
}: Props<T>) => {
  const { watch } = useFormContext();
  const value = watch(name as string); // Explicitly cast it to string
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className={styles.form_group}>
      <label htmlFor={String(name)} className={styles.label}>
        {label}
      </label>
      <div className={styles.input_wrapper}>
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
              className={`${
                errors[name] ? styles.not_valid : value ? styles.valid : ""
              } ${styles.input} `}
              {...rest}
            />
          )}
        />
        {type === "password" && (
          <button
            type="button"
            className={styles.password_toggle_icon}
            onClick={handleTogglePassword}
            aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
          >
            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
          </button>
        )}
      </div>
      {errors[name] && <p className={styles.error}>{errors[name]?.message as string}</p>}
    </div>
  );
};

export default TextInput;
