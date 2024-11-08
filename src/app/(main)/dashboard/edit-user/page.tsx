"use client";

import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";

import CitySelector from "@/app/auth/_components/CitySelector";

import { editUserSchema } from "@/helpers/validationSchema";
import { editUserHandler } from "@/helpers/editUserHandler";

import styles from "./EditUser.module.css";

const EditUser: React.FC = () => {
  const [isFormDirty, setIsFormDirty] = useState(false);

  useEffect(() => {
    document.title = "تغییر اطلاعات | فرابک";
  }, []);

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
    } catch (error) {
      toast.error("خطایی رخ داد. لطفا دوباره امتحان کنید.");
      console.error("EditUser error:", error);
    }
  };

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
        <form className={styles.editUser} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputs}>
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
          <button type="submit">ثبت اطلاعات</button>
        </form>
      </FormProvider>
    </>
  );
};

export default EditUser;

interface EditUserFormData {
  f_name?: string;
  l_name?: string;
  phone_number?: string;
  job?: string;
  email_address?: string;
  city?: string;
}

interface InputGroupProps {
  name: keyof EditUserFormData;
  label: string;
  placeholder?: string;
  control: any;
  errors: any;
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
  const { watch } = useFormContext();
  const value = watch(name);
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={name}>{label}</label>
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
            className={errors[name] ? styles.not_valid : styles.valid}
          />
        )}
      />
    </div>
  );
};
