"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";

import CitySelector from "@/app/auth/_components/CitySelector";
import TextInput from "@/app/auth/_components/TextInput";
import { useUser } from "@/context/UserContext";
import { signUpSchema } from "@/helpers/validationSchema";
import { useApiMutation } from "@/hooks/useApiMutation";
import { cn } from "@/lib/utils";

interface SignUpFormValues {
  f_name: string;
  l_name: string;
  phone_number: string;
  job: string;
  email_address: string;
  city: string;
  username: string;
  password: string;
  secondPassword: string;
}

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { mutate: signup, loading: isSubmitting } = useApiMutation("post");

  const { updateUserContext } = useUser();

  const methods = useForm<SignUpFormValues>({
    resolver: yupResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      f_name: "",
      l_name: "",
      phone_number: "",
      job: "",
      email_address: "",
      city: "",
      username: "",
      password: "",
      secondPassword: "",
    },
  });

  const {
    handleSubmit,
    trigger,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    const signUpData = {
      firstName: data.f_name,
      lastName: data.l_name,
      phoneNumber: data.phone_number,
      job: data.job,
      email: data.email_address,
      city: data.city,
      username: data.username,
      password: data.password,
    };

    setErrorMessage("");

    type SignupResponse = {
      message: string;
      error?: string;
    };

    const response = (await signup("/api/auth/signup", signUpData)) as SignupResponse | null;
    if (response) {
      if (response.message === "ثبت نام با موفقیت انجام شد") {
        updateUserContext();
        router.push("/dashboard");
      } else {
        setErrorMessage(response.message || "خطا در فرایند ثبت‌نام.");
      }
    } else {
      setErrorMessage("خطا در فرایند ثبت‌نام.");
    }
  };

  const nextStep = async () => {
    const fields: Array<keyof SignUpFormValues> = [
      "f_name",
      "l_name",
      "phone_number",
      "job",
      "email_address",
      "city",
      "username",
      "password",
      "secondPassword",
    ];

    const start = (step - 1) * 3;
    const end = start + 3;
    const valid = await trigger(fields.slice(start, end));
    if (valid) setStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => setStep((prevStep) => prevStep - 1);

  return (
    <FormProvider {...methods}>
      <div
        className={cn(
          "rtl m-0 flex h-dvh min-h-[550px] w-full max-w-[400px] min-w-[290px] items-center justify-center rounded-none bg-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[5px]",
          "min-[401px]:mx-6 min-[401px]:my-12 min-[401px]:h-auto min-[401px]:w-[90%] min-[401px]:max-w-[600px] min-[401px]:min-w-[350px] min-[401px]:rounded-[20px]",
          "min-[701px]:w-auto min-[701px]:max-w-[1250px] min-[701px]:min-w-0",
          "min-[861px]:mx-8 min-[861px]:min-h-[600px]",
          "min-[1201px]:mx-12"
        )}
      >
        <form
          className={cn(
            "rtl flex size-full min-h-[400px] flex-col justify-between gap-12 rounded-none bg-transparent px-4 py-12 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[5px]",
            "min-[401px]:rounded-[20px] min-[401px]:px-[1.3rem] min-[401px]:pt-4 min-[401px]:pb-6",
            "min-[701px]:w-[60%] min-[701px]:max-w-[550px] min-[701px]:rounded-l-none min-[701px]:rounded-r-[20px] min-[701px]:bg-white/30",
            "min-[861px]:min-h-[600px] min-[861px]:px-6",
            "min-[993px]:px-8"
          )}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="-mb-6 flex w-full flex-col items-start gap-[0.8rem] min-[861px]:mb-0 min-[861px]:flex-row min-[861px]:items-center min-[861px]:justify-center min-[861px]:gap-2">
            <Link href="/" className="self-center">
              <Image
                width={2066}
                height={182}
                src="/Farabak_Logo.webp"
                className="min-h-[20px] w-[175px] cursor-pointer"
                alt="farabak logo"
              />
            </Link>
            <div className="h-[2px] w-full bg-white min-[861px]:h-[60px] min-[861px]:w-[2px]"></div>
            <div className="flex flex-col">
              <h3 className="text-[1.2rem] font-medium min-[401px]:text-[1.1rem] min-[861px]:text-[1rem] min-[1201px]:text-[1.1rem]">
                ساخت حساب کاربری
              </h3>
              <div className="text-base font-light min-[861px]:text-[0.9rem] min-[1201px]:text-base">
                شرکت فرابک
              </div>
            </div>
          </div>

          {step === 1 && (
            <div className={cn("flex flex-col gap-6")}>
              <TextInput
                name="f_name"
                label="نام"
                placeholder="لطفا نام خود را فارسی وارد کنید"
                control={methods.control}
                errors={errors}
              />
              <TextInput
                name="l_name"
                label="نام خانوادگی"
                placeholder="لطفا نام خانوادگی خود را فارسی وارد کنید"
                control={methods.control}
                errors={errors}
              />
              <TextInput
                name="phone_number"
                label="شماره تلفن همراه"
                placeholder="شماره تلفن همراه خود را با اعداد انگلیسی وارد کنید"
                control={methods.control}
                errors={errors}
                type="tel"
              />
            </div>
          )}

          {step === 2 && (
            <div className={cn("flex flex-col gap-6")}>
              <TextInput
                name="job"
                label="شغل"
                placeholder="شغل خود را فارسی وارد کنید"
                control={methods.control}
                errors={errors}
              />
              <TextInput
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
          )}

          {step === 3 && (
            <div className={cn("flex flex-col gap-6")}>
              <TextInput
                name="username"
                label="نام کاربری"
                placeholder="نام کاربری خود را انگلیسی وارد کنید"
                control={methods.control}
                errors={errors}
              />
              <TextInput
                name="password"
                label="کلمه عبور"
                placeholder="بین ۸ تا ۵۰ کارکتر | حروف انگلیسی و اعداد"
                control={methods.control}
                errors={errors}
                type="password"
              />
              <TextInput
                name="secondPassword"
                label="تکرار کلمه عبور"
                placeholder="باید با کلمه عبوری که بالا وارد شده یکسان باشد"
                control={methods.control}
                errors={errors}
                type="password"
              />
            </div>
          )}

          <input
            type="submit"
            value={isSubmitting ? "در حال ثبت‌نام..." : "ثبت‌نام در حساب کاربری"}
            disabled={isSubmitting || step !== 3}
            readOnly
            className={cn(
              "mt-4 -mb-4 w-full cursor-pointer rounded-[8px] border-none bg-(--primary) px-0 py-[0.8rem] text-base font-medium text-white transition-[background-color,box-shadow] duration-300 hover:bg-[#036bf4] hover:shadow-[rgba(0,0,0,0.25)_0_8px_15px] disabled:cursor-not-allowed"
            )}
          />

          {errorMessage && (
            <p className={cn("text-[0.9rem] font-medium text-[#e74c3c]")}>{errorMessage}</p>
          )}

          <div className="-mb-6 flex w-full items-center justify-between min-[861px]:mb-4">
            <button
              type="button"
              className={cn(
                "box-border inline-block min-h-[20px] min-w-0 cursor-pointer appearance-none rounded-[10px] border-2 border-[#03a9f4] bg-transparent px-[36px] py-[10px] text-center text-[14px] font-semibold text-black transition-[transform,background-color,color,box-shadow] duration-300 outline-none hover:translate-y-[-2px] hover:bg-[#03a9f4] hover:text-white hover:shadow-[rgba(0,0,0,0.25)_0_8px_15px] disabled:cursor-not-allowed disabled:border-[#a0a0a0] disabled:bg-[#f3f3f3] disabled:text-black disabled:hover:translate-y-0 disabled:hover:shadow-none min-[861px]:rounded-[15px] min-[861px]:py-[12px] min-[861px]:text-[16px]"
              )}
              id="prev"
              onClick={prevStep}
              disabled={step === 1}
            >
              قبلی
            </button>
            <button
              type="button"
              className={cn(
                "box-border inline-block min-h-[20px] min-w-0 cursor-pointer appearance-none rounded-[10px] border-2 border-[#03a9f4] bg-transparent px-[36px] py-[10px] text-center text-[14px] font-semibold text-black transition-[transform,background-color,color,box-shadow] duration-300 outline-none hover:translate-y-[-2px] hover:bg-[#03a9f4] hover:text-white hover:shadow-[rgba(0,0,0,0.25)_0_8px_15px] disabled:cursor-not-allowed disabled:border-[#a0a0a0] disabled:bg-[#f3f3f3] disabled:text-black disabled:hover:translate-y-0 disabled:hover:shadow-none min-[861px]:rounded-[15px] min-[861px]:py-[12px] min-[861px]:text-[16px]"
              )}
              id="next"
              onClick={nextStep}
              disabled={step === 3}
            >
              بعدی
            </button>
          </div>
          <div className={cn("flex flex-col gap-4 self-end")}>
            <div className={cn("relative mb-4 flex w-full items-center justify-center")}>
              <div
                className={cn(
                  "absolute inset-s-0 top-1/2 h-[2px] w-[47%] -translate-y-1/2 rounded-lg bg-white"
                )}
              ></div>
              <div
                className={cn(
                  "absolute inset-e-0 top-1/2 h-[2px] w-[47%] -translate-y-1/2 rounded-lg bg-white"
                )}
              ></div>
              <div className="relative z-10">یا</div>
            </div>
            <div className="flex w-full justify-center gap-2">
              حساب کاربری دارید؟
              <Link href="/auth/login" className="cursor-pointer text-(--dark-blue)">
                ورود به حساب کاربری
              </Link>
            </div>
          </div>
        </form>
        <div className="hidden w-[60%] flex-col items-center justify-center gap-8 text-center min-[701px]:mx-6 min-[701px]:flex">
          <Image
            src="/signUp_image.svg"
            alt="farabak-signUp-Image"
            width={552}
            height={412}
            quality={100}
            className="min-[701px]:w-[40vw] min-[701px]:min-w-[200px] min-[993px]:w-[45vw] min-[993px]:min-w-[300px] min-[1201px]:w-[30vw] min-[1201px]:min-w-[500px]"
          />
          <h3 className="min-[701px]:w-full min-[701px]:text-[1.1rem] min-[861px]:text-[1.3rem] min-[993px]:w-[70%] min-[1201px]:text-[1.3rem]">
            با ساخت حساب کاربری خود، میتوانید از تمامی امکانات وبسایت استفاده کنید.
          </h3>
        </div>
      </div>
    </FormProvider>
  );
};

export default SignUp;
