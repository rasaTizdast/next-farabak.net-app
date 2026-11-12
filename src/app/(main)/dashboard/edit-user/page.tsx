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

import CitySelector from "@/app/auth/_components/CitySelector";
import { useUser } from "@/context/UserContext";
import { editUserHandler } from "@/helpers/editUserHandler";
import { editUserSchema } from "@/helpers/validationSchema";

interface EditUserFormData {
  f_name: string;
  l_name: string;
  phone_number: string;
  job: string;
  email_address: string;
  city: string;
}

type Feedback =
  | { type: "idle" }
  | { type: "pending"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

function mapFormToApiData(formData: EditUserFormData) {
  return {
    firstName: formData.f_name,
    lastName: formData.l_name,
    phoneNumber: formData.phone_number,
    email: formData.email_address,
    city: formData.city,
    job: formData.job,
  };
}

function getErrorMessage(error: unknown) {
  return typeof error === "string"
    ? error
    : error instanceof Error
      ? error.message
      : "خطایی رخ داد. لطفاً دوباره امتحان کنید.";
}

const EditUser: React.FC = () => {
  const { user, updateUserContext } = useUser();
  const [feedback, setFeedback] = useState<Feedback>({ type: "idle" });

  const methods = useForm<EditUserFormData>({
    resolver: yupResolver(editUserSchema),
    mode: "onChange",
    defaultValues: {
      f_name: "",
      l_name: "",
      phone_number: "",
      job: "",
      email_address: "",
      city: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = methods;

  useEffect(() => {
    if (!user || isDirty) return;

    reset({
      f_name: user.firstName,
      l_name: user.lastName,
      phone_number: user.phoneNumber,
      email_address: user.email,
      job: "",
      city: "",
    });
  }, [isDirty, reset, user]);

  const onSubmit = async (data: EditUserFormData) => {
    setFeedback({ type: "pending", message: "در حال ذخیره اطلاعات…" });

    try {
      await editUserHandler(mapFormToApiData(data));
      await updateUserContext();
      reset(data);
      setFeedback({ type: "success", message: "اطلاعات شما با موفقیت ذخیره شد." });
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
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <header>
        <p className="mb-2 text-sm font-semibold text-(--farabak-action-blue)">حساب کاربری</p>
        <h1 className="text-2xl font-extrabold text-(--farabak-ink-deep)">ویرایش اطلاعات</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-(--farabak-ink-muted)">
          مشخصات تماس خود را بررسی کنید تا پیگیری فاکتورها و درخواست‌ها دقیق‌تر انجام شود.
        </p>
      </header>

      <FormProvider {...methods}>
        <form
          aria-label="فرم ویرایش اطلاعات"
          className="flex w-full flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid w-full gap-5 sm:grid-cols-2">
            <InputGroup
              name="f_name"
              label="نام"
              placeholder="نام خود را فارسی وارد کنید"
              autoComplete="given-name"
              control={methods.control}
              errors={errors}
            />
            <InputGroup
              name="l_name"
              label="نام خانوادگی"
              placeholder="نام خانوادگی خود را فارسی وارد کنید"
              autoComplete="family-name"
              control={methods.control}
              errors={errors}
            />
            <InputGroup
              name="phone_number"
              label="شماره تلفن همراه"
              placeholder="شماره تلفن همراه با اعداد انگلیسی"
              autoComplete="tel"
              control={methods.control}
              errors={errors}
              type="tel"
            />
            <InputGroup
              name="job"
              label="شغل"
              placeholder="شغل خود را فارسی وارد کنید"
              autoComplete="organization-title"
              control={methods.control}
              errors={errors}
            />
            <InputGroup
              name="email_address"
              label="آدرس ایمیل"
              placeholder="آدرس ایمیل خود را وارد کنید"
              autoComplete="email"
              control={methods.control}
              errors={errors}
              type="email"
            />
            <CitySelector
              control={methods.control}
              name="city"
              label="استان محل سکونت"
              placeholder="استان محل سکونت را به فارسی وارد کنید"
              errors={errors}
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
            {isSubmitting ? "در حال ذخیره…" : "ذخیره اطلاعات"}
          </button>
        </form>
      </FormProvider>
    </div>
  );
};

interface InputGroupProps {
  name: keyof EditUserFormData;
  label: string;
  placeholder?: string;
  control: Control<EditUserFormData>;
  errors: FieldErrors<EditUserFormData>;
  autoComplete?: string;
  type?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({
  name,
  label,
  placeholder,
  control,
  errors,
  autoComplete,
  type = "text",
}) => {
  const { watch } = useFormContext<EditUserFormData>();
  const value = watch(name);
  const hasError = !!errors[name];

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={name} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            autoComplete={autoComplete}
            type={type}
            id={name}
            placeholder={placeholder}
            value={value ?? ""}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
            className={`w-full rounded-xl border bg-white p-3.5 text-start text-base text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) ${hasError ? "border-red-700" : "border-slate-300"}`}
          />
        )}
      />
      {hasError && (
        <p id={`${name}-error`} role="alert" className="text-sm leading-6 text-red-700">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

export default EditUser;
