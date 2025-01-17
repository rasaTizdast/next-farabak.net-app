/* eslint-disable */

"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "@/helpers/validationSchema";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { changePasswordHandler } from "@/helpers/changePasswordHandler";

import styles from "./ChangePassword.module.css";

interface FormData {
  currentPassword: string;
  newPassword: string;
}

const ChangePassword = () => {
  const methods = useForm<FormData>({
    resolver: yupResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors, isDirty },
  } = methods;

  const onSubmit = async (data: FormData) => {
    try {
      await changePasswordHandler(data);
      toast.success("کلمه عبور شما با موفقیت تغییر پیدا کرد!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "خطایی رخ داد. لطفا دوباره امتحان کنید.";
      toast.error(errorMessage);
      console.error("Error changing password:", error.message);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = ""; // For modern browsers, this triggers the dialog.
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />
      <FormProvider {...methods}>
        <form className={styles.changePass} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputs}>
            <InputGroup
              name="currentPassword"
              label="کلمه عبور قبلی"
              placeholder="کلمه عبور قبلی خود را وارد کنید"
              control={methods.control}
              errors={errors}
              type="password"
              autoComplete="current-password"
            />
            <InputGroup
              name="newPassword"
              label="کلمه عبور جدید"
              placeholder="کلمه عبور جدید خود را وارد کنید"
              control={methods.control}
              errors={errors}
              type="password"
              autoComplete="new-password"
            />
          </div>

          <button type="submit">ثبت اطلاعات</button>
        </form>
      </FormProvider>
    </>
  );
};

export default ChangePassword;

interface InputGroupProps {
  name: keyof FormData;
  label: string;
  placeholder?: string;
  control: any;
  errors: any;
  autoComplete?: string;
  type?: string;
}

const InputGroup = ({
  name,
  label,
  placeholder,
  control,
  errors,
  autoComplete,
  type = "text",
}: InputGroupProps) => {
  const { watch } = useFormContext<FormData>();
  const value = watch(name);
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={styles.inputGroup}>
      <label htmlFor={name}>{label}</label>
      <div className={styles.input_wrapper}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              autoComplete={autoComplete}
              {...field}
              type={type === "password" && showPassword ? "text" : type}
              id={name}
              placeholder={placeholder}
              value={value ?? ""}
              className={
                errors[name] ? styles.not_valid : value ? styles.valid : ""
              }
            />
          )}
        />
        {type === "password" && (
          <button
            type="button"
            className={styles.password_toggle_icon}
            onClick={handleTogglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
          </button>
        )}
      </div>
      {errors[name] && <p className={styles.error}>{errors[name].message}</p>}
    </div>
  );
};
