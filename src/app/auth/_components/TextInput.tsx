import { useState } from "react";
import {
  Controller,
  useFormContext,
  FieldValues,
  Control,
} from "react-hook-form";
import styles from "./TextInput.module.css";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

// Define Prop types
type Props = {
  name: string;
  label: string;
  placeholder: string;
  control: Control<FieldValues>; // Correct type for control from react-hook-form
  errors: { [key: string]: any }; // This can be typed better if you know the exact structure of errors
  rules?: object; // Optional rules, these can be made more strict based on your form schema
  autoComplete?: string; // Optional autocomplete value
  type?: "text" | "password" | "email"; // Specify only allowed types
};

const TextInput = ({
  name,
  label,
  placeholder,
  control,
  errors,
  rules,
  autoComplete = "off", // Default value for autoComplete
  type = "text", // Default value for type
  ...rest
}: Props) => {
  const { watch } = useFormContext();
  const value = watch(name);
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className={styles.form_group}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <div className={styles.input_wrapper}>
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field }) => (
            <input
              autoComplete={autoComplete}
              {...field}
              type={type === "password" && showPassword ? "text" : type}
              id={name}
              placeholder={placeholder}
              value={value ?? ""}
              className={`${
                errors[name] ? styles.not_valid : value ? styles.valid : ""
              }
              ${styles.input}
              `}
              {...rest}
            />
          )}
        />
        {type === "password" && (
          <span
            className={styles.password_toggle_icon}
            onClick={handleTogglePassword}
          >
            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        )}
      </div>
      {errors[name] && <p className={styles.error}>{errors[name].message}</p>}
    </div>
  );
};

export default TextInput;
