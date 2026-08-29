"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";

import {
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} from "@/helpers/validationSchema";
import { useApiMutation } from "@/hooks/useApiMutation";

import TextInput from "./TextInput";

enum ForgotPasswordStep {
  EMAIL = "email",
  VERIFY_CODE = "verifyCode",
  RESET_PASSWORD = "resetPassword",
  SUCCESS = "success",
}

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>(ForgotPasswordStep.EMAIL);
  const [email, setEmail] = useState<string>("");
  const verificationCodeRef = useRef<string>("");
  const resetTokenRef = useRef<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { mutate: forgotPassword, loading: submittingForgot } = useApiMutation("post");
  const { mutate: verifyCode, loading: submittingVerify } = useApiMutation("post");
  const { mutate: resetPassword, loading: submittingReset } = useApiMutation("post");

  // Form for email step
  const emailMethods = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  // Form for verification code step
  const codeMethods = useForm({
    resolver: yupResolver(verifyCodeSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
    },
  });

  // Form for reset password step
  const passwordMethods = useForm({
    resolver: yupResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Handle email submission
  const handleEmailSubmit = async (data: { email: string }) => {
    setErrorMessage("");

    const response = (await forgotPassword("/api/auth/forgot-password", data)) as any;
    if (response) {
      if (response.emailSent && response.resetToken) {
        setEmail(data.email);
        resetTokenRef.current = response.resetToken;
        setCurrentStep(ForgotPasswordStep.VERIFY_CODE);
      } else {
        setErrorMessage(response.message || "خطا در ارسال ایمیل");
      }
    } else {
      setErrorMessage("خطا در ارسال ایمیل");
    }
  };

  // Handle verification code submission
  const handleCodeSubmit = async (data: { code: string }) => {
    setErrorMessage("");

    const response = (await verifyCode("/api/auth/verify-reset-code", {
      email,
      code: data.code,
      resetToken: resetTokenRef.current,
    })) as any;
    if (response) {
      if (response.valid) {
        verificationCodeRef.current = data.code;
        setCurrentStep(ForgotPasswordStep.RESET_PASSWORD);
      } else {
        setErrorMessage(response.error || "کد تایید نامعتبر است");
      }
    } else {
      setErrorMessage("کد تایید نامعتبر است");
    }
  };

  // Handle password reset submission
  const handlePasswordSubmit = async (data: { password: string; confirmPassword: string }) => {
    setErrorMessage("");

    const response = (await resetPassword("/api/auth/reset-password", {
      email,
      code: verificationCodeRef.current,
      newPassword: data.password,
      resetToken: resetTokenRef.current,
    })) as any;
    if (response) {
      if (response.success) {
        setCurrentStep(ForgotPasswordStep.SUCCESS);
      } else {
        setErrorMessage(response.error || "خطا در بازیابی رمز عبور");
      }
    } else {
      setErrorMessage("خطا در بازیابی رمز عبور");
    }
  };

  // Close modal and reset state
  const handleClose = () => {
    setCurrentStep(ForgotPasswordStep.EMAIL);
    setEmail("");
    verificationCodeRef.current = "";
    resetTokenRef.current = "";
    setErrorMessage("");
    emailMethods.reset();
    codeMethods.reset();
    passwordMethods.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 p-5">
      <div className="rtl relative w-full max-w-[450px] rounded-lg bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.15)] md:p-8">
        <button
          type="button"
          className="absolute inset-s-[10px] top-[10px] flex size-[30px] cursor-pointer items-center justify-center rounded-full border-none bg-none text-[24px] text-[#666] hover:bg-[#f5f5f5] hover:text-[#333]"
          onClick={handleClose}
          aria-label="بستن"
        >
          ×
        </button>

        {currentStep === ForgotPasswordStep.EMAIL && (
          <FormProvider {...emailMethods}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void emailMethods.handleSubmit(handleEmailSubmit)(e);
              }}
            >
              <h2 className="m-0 mb-[15px] text-center text-[24px] text-[#333]">
                بازیابی رمز عبور
              </h2>
              <p className="mb-[20px] text-center text-[14px] text-[#666]">
                آدرس ایمیل خود را وارد کنید تا کد بازیابی برای شما ارسال شود
              </p>

              <TextInput
                name="email"
                label="ایمیل"
                placeholder="آدرس ایمیل خود را وارد کنید"
                control={emailMethods.control}
                errors={emailMethods.formState.errors}
                type="email"
              />

              {errorMessage && (
                <p className="mt-[5px] text-start text-[14px] text-[#e53e3e]">{errorMessage}</p>
              )}

              <div className="mt-[20px] flex flex-col gap-[10px]">
                <button
                  type="submit"
                  className="cursor-pointer rounded-[4px] border-none bg-[#3182ce] px-[16px] py-[12px] text-[14px] text-white transition-colors duration-200 hover:bg-[#2b6cb0] disabled:cursor-not-allowed disabled:bg-[#90cdf4]"
                  disabled={submittingForgot}
                >
                  {submittingForgot ? "در حال ارسال..." : "ارسال کد بازیابی"}
                </button>
              </div>
            </form>
          </FormProvider>
        )}

        {currentStep === ForgotPasswordStep.VERIFY_CODE && (
          <FormProvider {...codeMethods}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void codeMethods.handleSubmit(handleCodeSubmit)(e);
              }}
            >
              <h2 className="m-0 mb-[15px] text-center text-[24px] text-[#333]">
                تایید کد بازیابی
              </h2>
              <p className="mb-[20px] text-center text-[14px] text-[#666]">
                کد بازیابی ارسال شده به ایمیل {email} را وارد کنید
              </p>

              <TextInput
                name="code"
                label="کد تایید"
                placeholder="کد ۶ رقمی را وارد کنید"
                control={codeMethods.control}
                errors={codeMethods.formState.errors}
                type="text"
              />

              {errorMessage && (
                <p className="mt-[5px] text-start text-[14px] text-[#e53e3e]">{errorMessage}</p>
              )}

              <div className="mt-[20px] flex flex-col gap-[10px]">
                <button
                  type="submit"
                  className="cursor-pointer rounded-[4px] border-none bg-[#3182ce] px-[16px] py-[12px] text-[14px] text-white transition-colors duration-200 hover:bg-[#2b6cb0] disabled:cursor-not-allowed disabled:bg-[#90cdf4]"
                  disabled={submittingVerify}
                >
                  {submittingVerify ? "در حال تایید..." : "تایید کد"}
                </button>

                <button
                  type="button"
                  className="cursor-pointer rounded-[4px] border-none bg-[#e2e8f0] px-[16px] py-[12px] text-[14px] text-[#4a5568] transition-colors duration-200 hover:bg-[#cbd5e0]"
                  onClick={() => setCurrentStep(ForgotPasswordStep.EMAIL)}
                >
                  بازگشت
                </button>
              </div>
            </form>
          </FormProvider>
        )}

        {currentStep === ForgotPasswordStep.RESET_PASSWORD && (
          <FormProvider {...passwordMethods}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void passwordMethods.handleSubmit(handlePasswordSubmit)(e);
              }}
            >
              <h2 className="m-0 mb-[15px] text-center text-[24px] text-[#333]">تغییر رمز عبور</h2>
              <p className="mb-[20px] text-center text-[14px] text-[#666]">
                رمز عبور جدید خود را وارد کنید
              </p>

              <TextInput
                name="password"
                label="رمز عبور جدید"
                placeholder="رمز عبور جدید خود را وارد کنید"
                control={passwordMethods.control}
                errors={passwordMethods.formState.errors}
                type="password"
              />

              <div className="my-5"></div>

              <TextInput
                name="confirmPassword"
                label="تکرار رمز عبور"
                placeholder="رمز عبور را مجدداً وارد کنید"
                control={passwordMethods.control}
                errors={passwordMethods.formState.errors}
                type="password"
              />

              {errorMessage && (
                <p className="mt-[5px] text-start text-[14px] text-[#e53e3e]">{errorMessage}</p>
              )}

              <div className="mt-[20px] flex flex-col gap-[10px]">
                <button
                  type="submit"
                  className="cursor-pointer rounded-[4px] border-none bg-[#3182ce] px-[16px] py-[12px] text-[14px] text-white transition-colors duration-200 hover:bg-[#2b6cb0] disabled:cursor-not-allowed disabled:bg-[#90cdf4]"
                  disabled={submittingReset}
                >
                  {submittingReset ? "در حال ذخیره..." : "تغییر رمز عبور"}
                </button>

                <button
                  type="button"
                  className="cursor-pointer rounded-[4px] border-none bg-[#e2e8f0] px-[16px] py-[12px] text-[14px] text-[#4a5568] transition-colors duration-200 hover:bg-[#cbd5e0]"
                  onClick={() => setCurrentStep(ForgotPasswordStep.VERIFY_CODE)}
                >
                  بازگشت
                </button>
              </div>
            </form>
          </FormProvider>
        )}

        {currentStep === ForgotPasswordStep.SUCCESS && (
          <div className="flex flex-col items-center text-center">
            <h2 className="m-0 mb-[15px] text-center text-[24px] text-[#333]">
              تغییر رمز عبور با موفقیت انجام شد
            </h2>
            <p className="mb-[20px] text-center text-[14px] text-[#666]">
              رمز عبور شما با موفقیت تغییر یافت. اکنون می‌توانید با رمز عبور جدید وارد شوید.
            </p>

            <button
              type="button"
              className="cursor-pointer rounded-[4px] border-none bg-[#3182ce] px-[16px] py-[12px] text-[14px] text-white transition-colors duration-200 hover:bg-[#2b6cb0]"
              onClick={handleClose}
            >
              بازگشت به صفحه ورود
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
