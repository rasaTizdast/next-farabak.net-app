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
import { cn } from "@/lib/utils";

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
      <div
        className={cn(
          "rtl m-0 flex h-dvh min-h-[550px] w-full max-w-[400px] min-w-[290px] items-stretch justify-center rounded-none bg-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[5px]",
          "min-[401px]:mx-6 min-[401px]:my-12 min-[401px]:h-auto min-[401px]:w-[90%] min-[401px]:max-w-[600px] min-[401px]:min-w-[350px] min-[401px]:rounded-[20px]",
          "min-[701px]:w-auto min-[701px]:max-w-[1250px] min-[701px]:min-w-0",
          "min-[861px]:mx-8 min-[861px]:min-h-[600px]",
          "min-[1201px]:mx-12"
        )}
      >
        <form
          className={cn(
            "rtl flex min-h-[400px] flex-col justify-between gap-12 rounded-none bg-transparent px-4 py-12 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[5px]",
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
                ورود به حساب کاربری
              </h3>
              <div className="text-base font-light min-[861px]:text-[0.9rem] min-[1201px]:text-base">
                شرکت فرابک
              </div>
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
            {/* <button
              type="button"
              className={cn(
                "dashed -mt-12 mb-8 inline-block w-fit cursor-pointer text-[0.8rem] text-dark-blue underline underline-offset-[6px]"
              )}
              onClick={() => setIsForgotPasswordModalOpen(true)}
            >
              کلمه عبور خود را فراموش کرده‌اید؟
            </button> */}
            <input
              type="submit"
              value={isSubmitting ? "در حال ورود..." : "ورود به حساب کاربری"}
              disabled={isSubmitting}
              readOnly
              className={cn(
                "bg-primary mt-0 -mb-4 w-full cursor-pointer rounded-[8px] border-none px-0 py-[0.8rem] text-base font-medium text-white transition-[background-color,box-shadow] duration-300 hover:bg-[#036bf4] hover:shadow-[rgba(0,0,0,0.25)_0_8px_15px] disabled:cursor-not-allowed"
              )}
              data-testid="submit-button"
            />
          </div>

          {errorMessage && (
            <p className={cn("text-[0.9rem] font-medium text-[#e74c3c]")}>{errorMessage}</p>
          )}

          <div className={cn("flex flex-col items-center gap-4 self-center")}>
            <div className="relative mb-4 flex w-full items-center justify-center">
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
            <div className="flex items-center justify-center gap-2">
              <span>کاربر جدید هستید؟</span>
              <Link href="/auth/signup" className={cn("text-dark-blue cursor-pointer")}>
                ثبت نام
              </Link>
            </div>
          </div>
        </form>

        <div className="hidden w-[60%] flex-col items-center justify-center gap-8 text-center min-[701px]:mx-6 min-[701px]:flex">
          <div className="relative min-[701px]:h-[28vw] min-[701px]:min-h-[140px] min-[701px]:w-[40vw] min-[701px]:min-w-[200px] min-[993px]:h-[31.5vw] min-[993px]:min-h-[210px] min-[993px]:w-[45vw] min-[993px]:min-w-[300px] min-[1201px]:h-[21vw] min-[1201px]:min-h-[350px] min-[1201px]:w-[30vw] min-[1201px]:min-w-[500px]">
            <Image
              src="/signIn_image.svg"
              width={552}
              height={412}
              quality={100}
              alt="farabak-signIn-Image"
              className="min-[701px]:size-full min-[701px]:object-contain"
            />
          </div>
          <h3 className="min-[701px]:w-full min-[701px]:text-[1.1rem] min-[861px]:text-[1.3rem] min-[993px]:w-[70%] min-[1201px]:text-[1.3rem]">
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
