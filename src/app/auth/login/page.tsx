"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";

import { useUser } from "@/context/UserContext";
import { signInSchema } from "@/helpers/validationSchema";
import { useApiMutation } from "@/hooks/useApiMutation";

import ForgotPasswordModal from "../_components/ForgotPasswordModal";
import TextInput from "../_components/TextInput";

const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const router = useRouter();
  const { mutate: login, loading: isSubmitting } = useApiMutation("post");

  const { updateUserContext } = useUser();

  const methods = useForm({
    resolver: yupResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: { username: string; password: string }) => {
    setErrorMessage("");

    type LoginResponse = {
      message: string;
      role: string;
      error?: string;
    };

    const response = (await login("/api/auth/login", data)) as LoginResponse | null;
    if (response) {
      if (response.message === "ورود با موفقیت انجام شد") {
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
          await updateUserContext();
        } catch (userError) {
          console.error("Error updating user context:", userError);
        }

        const userRole = response.role;
        if (userRole === "Admin") {
          router.push("/admin");
        } else if (userRole === "Branch") {
          router.push("/admin/branches/my");
        } else {
          router.push("/dashboard");
        }
      } else {
        setErrorMessage(response.error || response.message || "خطا در فرایند ورود.");
      }
    } else {
      setErrorMessage("خطا در فرایند ورود.");
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="m-12 flex min-h-[600px] max-w-[1250px] items-center rounded-[20px] bg-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[5px] md:m-8 md:min-h-[550px] lg:m-6">
        <form
          className="flex h-full min-h-[600px] w-[60%] max-w-[550px] flex-col justify-between gap-12 rounded-r-[20px] bg-white/30 p-6 pt-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[5px] md:p-[1.3rem]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex w-full items-center justify-center gap-2">
            <Link href="/">
              <Image
                width={2066}
                height={182}
                src="/Farabak_Logo.webp"
                className="min-h-[20px] w-[175px] cursor-pointer"
                alt="farabak logo"
              />
            </Link>
            <div className="h-[60px] w-[2px] bg-white md:h-[60px] md:w-[2px] lg:h-[2px] lg:w-full"></div>
            <div className="flex flex-col">
              <h3 className="text-[1.1rem] font-medium md:text-[1rem] lg:text-[1.1rem]">
                ورود به حساب کاربری
              </h3>
              <div className="text-base font-light md:text-[0.9rem] lg:text-base">شرکت فرابک</div>
            </div>
          </div>

          <div className="flex flex-col gap-16">
            <TextInput
              name="username"
              label="نام کاربری"
              type="text"
              placeholder="نام کاربری خود را انگلیسی وارد کنید"
              control={methods.control}
              errors={errors}
              autoComplete="username"
              data-testid="username-input"
            />
            <TextInput
              name="password"
              label="کلمه عبور"
              placeholder="کلمه عبور خود را وارد کنید"
              control={methods.control}
              errors={errors}
              type="password"
              autoComplete="current-password"
              data-testid="password-input"
            />
            <button
              type="button"
              className="dashed -mt-12 mb-8 inline-block w-fit cursor-pointer text-[0.8rem] text-[#003262] underline underline-offset-[6px]"
              onClick={() => setIsForgotPasswordModalOpen(true)}
            >
              کلمه عبور خود را فراموش کرده‌اید؟
            </button>
            <input
              type="submit"
              value={isSubmitting ? "در حال ورود..." : "ورود به حساب کاربری"}
              disabled={isSubmitting}
              readOnly
              className="mt-0 -mb-4 w-full cursor-pointer rounded-lg border-none bg-[#03a9f4] px-0 py-[0.8rem] text-base font-medium text-white transition-[background-color,box-shadow] duration-300 hover:bg-[#036bf4] hover:shadow-[rgba(0,0,0,0.25)_0_8px_15px] disabled:cursor-not-allowed"
              data-testid="submit-button"
            />
          </div>

          {errorMessage && (
            <p className="text-[0.9rem] font-medium text-[#e74c3c]">{errorMessage}</p>
          )}

          <div className="flex flex-col gap-4 self-end">
            <div className="relative mb-4 flex w-full items-center justify-center">
              <div className="absolute inset-s-0 top-1/2 h-[2px] w-[47%] -translate-y-1/2 rounded-lg bg-white"></div>
              <div className="absolute inset-e-0 top-1/2 h-[2px] w-[47%] -translate-y-1/2 rounded-lg bg-white"></div>
              <div className="relative z-10">یا</div>
            </div>
            <div className="flex w-full justify-center gap-2">
              کاربر جدید هستید؟
              <Link href="/auth/signup" className="cursor-pointer text-[#0116cb]">
                ثبت نام
              </Link>
            </div>
          </div>
        </form>

        <div className="mx-6 hidden w-[60%] flex-col items-center justify-center gap-8 text-center lg:flex">
          <Image
            src="/signIn_image.svg"
            width={552}
            height={412}
            quality={100}
            alt="farabak-signIn-Image"
            className="w-[30vw] min-w-[500px] md:w-[45vw] md:min-w-[300px] lg:w-[40vw] lg:min-w-[200px]"
          />
          <h3 className="w-[70%] text-[1.3rem] font-semibold lg:text-[1.1rem]">
            با ورود به حساب کاربری خود، میتوانید از تمامی امکانات وبسایت استفاده کنید.
          </h3>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </FormProvider>
  );
};

export default SignIn;
