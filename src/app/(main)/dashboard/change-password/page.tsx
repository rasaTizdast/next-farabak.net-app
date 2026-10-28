"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

import { changePasswordHandler } from "@/helpers/changePasswordHandler";
import { changePasswordSchema } from "@/helpers/validationSchema";

interface FormData {
  currentPassword: string;
  newPassword: string;
}

type Feedback =
  | { type: "idle" }
  | { type: "pending"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

function getErrorMessage(error: unknown) {
  return typeof error === "string"
    ? error
    : error instanceof Error
      ? error.message
      : "خطایی رخ داد. لطفاً دوباره امتحان کنید.";
}

const ChangePassword = () => {
  const [feedback, setFeedback] = useState<Feedback>({ type: "idle" });
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
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (data: FormData) => {
    setFeedback({ type: "pending", message: "در حال به‌روزرسانی کلمه عبور…" });

    try {
      await changePasswordHandler(data);
      reset();
      setFeedback({ type: "success", message: "کلمه عبور شما با موفقیت تغییر کرد." });
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error) });
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <header>
        <p className="mb-2 text-sm font-semibold text-(--farabak-action-blue)">امنیت حساب</p>
        <h1 className="text-2xl font-extrabold text-(--farabak-ink-deep)">تغییر کلمه عبور</h1>
        <p className="mt-2 max-w-xl text-sm leading-7 text-(--farabak-ink-muted)">
          کلمه عبور فعلی و کلمه عبور جدید را وارد کنید. کلمه عبور جدید باید حداقل ۸ کاراکتر و شامل
          حروف و عدد انگلیسی باشد.
        </p>
      </header>

      <FormProvider {...methods}>
        <form
          aria-label="فرم تغییر کلمه عبور"
          className="flex w-full flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex w-full flex-col gap-5">
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

          {feedback.type !== "idle" && (
            <p
              role={feedback.type === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`rounded-xl border px-4 py-3 text-sm leading-6 ${feedback.type === "error" ? "border-red-200 bg-red-50 text-red-800" : feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-blue-200 bg-blue-50 text-blue-900"}`}
            >
              {feedback.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-(--farabak-action-blue) px-6 py-2 text-base font-semibold text-white transition-colors hover:bg-(--farabak-ink-deep) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none sm:w-fit"
          >
            {isSubmitting ? "در حال ذخیره…" : "ذخیره کلمه عبور"}
          </button>
        </form>
      </FormProvider>
    </div>
  );
};

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
  const hasError = !!errors[name];

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={name} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              autoComplete={autoComplete}
              type={type === "password" && showPassword ? "text" : type}
              id={name}
              placeholder={placeholder}
              value={value ?? ""}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${name}-error` : undefined}
              className={`w-full rounded-xl border bg-white p-3.5 ps-14 text-start text-base text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) ${hasError ? "border-red-700" : "border-slate-300"}`}
            />
          )}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute inset-s-[15px] top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[1.2rem] text-slate-700 focus-visible:outline-2 focus-visible:outline-(--farabak-action-blue)"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
            aria-pressed={showPassword}
          >
            {showPassword ? <FaRegEye aria-hidden="true" /> : <FaRegEyeSlash aria-hidden="true" />}
          </button>
        )}
      </div>
      {hasError && (
        <p id={`${name}-error`} role="alert" className="text-sm leading-6 text-red-700">
          {errors[name]?.message ?? "ورودی نامعتبر"}
        </p>
      )}
    </div>
  );
};

export default ChangePassword;
