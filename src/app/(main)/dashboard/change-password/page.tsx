"use client";

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

import { changePasswordHandler } from "@/helpers/changePasswordHandler"; // Import the handler

import styles from "./ChangePassword.module.css";

const ChangePassword = () => {
  const [isFormDirty, setIsFormDirty] = useState(false);

  const methods = useForm({
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
    watch,
  } = methods;

  useEffect(() => {
    const subscription = watch(() => {
      setIsFormDirty(isDirty);
    });
    return () => subscription.unsubscribe();
  }, [watch, isDirty]);

  const onSubmit = async (data) => {
    try {
      // Call the forgotPasswordHandler to send the password to the API
      await changePasswordHandler(data);
      toast.success("کلمه عبور شما با موفقیت تغییر پیدا کرد!");
    } catch (error) {
      toast.error("خطایی رخ داد. لطفا دوباره امتحان کنید.");
      console.error("Error changing password", error.message);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isFormDirty) {
        event.preventDefault();
        event.returnValue = ""; // For Chrome, the returnValue needs to be set to trigger the dialog.
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isFormDirty]);

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
              autoComplete="password"
            />
            <InputGroup
              name="newPassword"
              label="کلمه عبور جدید"
              placeholder="کلمه عبور جدید خود را وارد کنید"
              control={methods.control}
              errors={errors}
              type="password"
              autoComplete="password"
            />
          </div>

          <button type="submit">ثبت اطلاعات</button>
        </form>
      </FormProvider>
    </>
  );
};

export default ChangePassword;

interface FormData {
  currentPassword: string;
  newPassword: string;
}

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
  ...rest
}: InputGroupProps) => {
  const { watch } = useFormContext();
  const value = watch(name);
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
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
