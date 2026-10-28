"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  FieldErrors,
  Control,
} from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

import CitySelector from "@/app/auth/_components/CitySelector";
import { editUserHandler } from "@/helpers/editUserHandler";
import { editUserSchema } from "@/helpers/validationSchema";

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

const EditUser: React.FC = () => {
  const [isFormDirty, setIsFormDirty] = useState(false);

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
    formState: { errors, isDirty },
    watch,
  } = methods;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form's watch() returns a non-memoizable function required by the library API.
    const subscription = watch(() => {
      setIsFormDirty(isDirty);
    });
    return () => subscription.unsubscribe();
  }, [watch, isDirty]);

  const onSubmit = async (data: EditUserFormData) => {
    setIsFormDirty(false);
    const transformedData = mapFormToApiData(data);

    try {
      await editUserHandler(transformedData);
      toast.success("اطلاعات شما با موفقیت تغییر پیدا کرد!");
    } catch {
      toast.error("خطایی رخ داد. لطفا دوباره امتحان کنید.");
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isFormDirty) {
        event.preventDefault();
        event.returnValue = "";
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
        <form
          className="flex w-full max-w-2xl flex-col items-center justify-center gap-6 self-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex w-full flex-wrap justify-evenly gap-8">
            <InputGroup
              name="f_name"
              label="نام"
              placeholder="لطفا نام خود را فارسی وارد کنید"
              control={methods.control}
              errors={errors}
            />
            <InputGroup
              name="l_name"
              label="نام خانوادگی"
              placeholder="لطفا نام خانوادگی خود را فارسی وارد کنید"
              control={methods.control}
              errors={errors}
            />
            <InputGroup
              name="phone_number"
              label="شماره تلفن همراه"
              placeholder="شماره تلفن همراه خود را با اعداد انگلیسی وارد کنید"
              control={methods.control}
              errors={errors}
              type="tel"
            />
            <InputGroup
              name="job"
              label="شغل"
              placeholder="شغل خود را فارسی وارد کنید"
              control={methods.control}
              errors={errors}
            />
            <InputGroup
              name="email_address"
              label="آدرس ایمیل"
              placeholder="آدرس ایمیل خود را وارد کنید"
              control={methods.control}
              errors={errors}
              type="email"
            />
            <CitySelector
              control={methods.control}
              name="city"
              label="استان محل سکونت"
              placeholder="استان محل سکونت را به صورت فارسی وارد کنید"
              errors={errors}
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

export default EditUser;

interface EditUserFormData {
  f_name: string;
  l_name: string;
  phone_number: string;
  job: string;
  email_address: string;
  city: string;
}

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
  const hasValue = !!value;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={name} className="text-base">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            autoComplete={autoComplete}
            {...field}
            type={type}
            id={name}
            placeholder={placeholder}
            value={value ?? ""}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
            className={`w-full rounded-lg border border-slate-400 bg-white p-3.5 text-start text-base font-medium text-slate-900 placeholder:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
              hasError ? "border-2 border-red-700" : hasValue ? "border-2 border-green-700" : ""
            }`}
          />
        )}
      />
      {hasError && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};
