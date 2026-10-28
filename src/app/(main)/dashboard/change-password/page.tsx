"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  Control,
  FieldErrors,
} from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

import { changePasswordHandler } from "@/helpers/changePasswordHandler";
import { changePasswordSchema } from "@/helpers/validationSchema";

interface FormData {
  currentPassword: string;
  newPassword: string;
}

const onSubmit = async (data: FormData) => {
  try {
    await changePasswordHandler(data);
    toast.success("کلمه عبور شما با موفقیت تغییر پیدا کرد!");
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "data" in error.response
        ? (error.response.data as { message?: string })?.message ||
          "خطایی رخ داد. لطفا دوباره امتحان کنید."
        : "خطایی رخ داد. لطفا دوباره امتحان کنید.";
    toast.error(errorMessage);
  }
};

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

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
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
        <form
          className="mt-6 flex w-full max-w-[500px] min-w-[190px] flex-col items-center justify-center gap-6 self-center rounded-[6px] bg-white p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex w-full flex-wrap justify-evenly gap-8">
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

          <button
            type="submit"
            className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-[#003262] px-6 py-2 text-base text-white transition-colors hover:bg-[#000814] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            ثبت اطلاعات
          </button>
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
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
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

  const hasError = !!errors[name];
  const hasValue = !!value;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={name} className="text-base">
        {label}
      </label>
      <div className="relative">
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
              aria-invalid={hasError}
              aria-describedby={hasError ? `${name}-error` : undefined}
              className={`w-full rounded-lg border border-slate-400 bg-white p-3.5 ps-14 text-start text-base font-medium text-slate-900 placeholder:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                hasError ? "border-2 border-red-700" : hasValue ? "border-2 border-green-700" : ""
              }`}
            />
          )}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute inset-s-[15px] top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[1.2rem] text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-700"
            onClick={handleTogglePassword}
            aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
          >
            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
          </button>
        )}
      </div>
      {hasError && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
          {errors[name]?.message ?? "ورودی نامعتبر"}
        </p>
      )}
    </div>
  );
};
