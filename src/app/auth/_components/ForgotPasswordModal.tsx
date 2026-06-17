"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useApiMutation } from "@/hooks/useApiMutation";

import {
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} from "@/helpers/validationSchema";

import styles from "./ForgotPasswordModal.module.css";
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

// The component that will be exported
const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>(ForgotPasswordStep.EMAIL);
  const [email, setEmail] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");
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

    const response = await forgotPassword("/api/auth/forgot-password", data) as any;
    if (response) {
      if (response.emailSent && response.resetToken) {
        setEmail(data.email);
        setResetToken(response.resetToken);
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

    const response = await verifyCode("/api/auth/verify-reset-code", {
      email,
      code: data.code,
      resetToken,
    }) as any;
    if (response) {
      if (response.valid) {
        setVerificationCode(data.code);
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

    const response = await resetPassword("/api/auth/reset-password", {
      email,
      code: verificationCode,
      newPassword: data.password,
      resetToken,
    }) as any;
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
    setVerificationCode("");
    setResetToken("");
    setErrorMessage("");
    emailMethods.reset();
    codeMethods.reset();
    passwordMethods.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button type="button" className={styles.closeButton} onClick={handleClose}>
          ×
        </button>

        {currentStep === ForgotPasswordStep.EMAIL && (
          <FormProvider {...emailMethods}>
            <form onSubmit={emailMethods.handleSubmit(handleEmailSubmit)}>
              <h2 className={styles.modalTitle}>بازیابی رمز عبور</h2>
              <p className={styles.modalDescription}>
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

              {errorMessage && <p className={styles.error}>{errorMessage}</p>}

              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.submitButton} disabled={submittingForgot}>
                  {submittingForgot ? "در حال ارسال..." : "ارسال کد بازیابی"}
                </button>
              </div>
            </form>
          </FormProvider>
        )}

        {currentStep === ForgotPasswordStep.VERIFY_CODE && (
          <FormProvider {...codeMethods}>
            <form onSubmit={codeMethods.handleSubmit(handleCodeSubmit)}>
              <h2 className={styles.modalTitle}>تایید کد بازیابی</h2>
              <p className={styles.modalDescription}>
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

              {errorMessage && <p className={styles.error}>{errorMessage}</p>}

              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.submitButton} disabled={submittingVerify}>
                  {submittingVerify ? "در حال تایید..." : "تایید کد"}
                </button>

                <button
                  type="button"
                  className={styles.backButton}
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
            <form onSubmit={passwordMethods.handleSubmit(handlePasswordSubmit)}>
              <h2 className={styles.modalTitle}>تغییر رمز عبور</h2>
              <p className={styles.modalDescription}>رمز عبور جدید خود را وارد کنید</p>

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

              {errorMessage && <p className={styles.error}>{errorMessage}</p>}

              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.submitButton} disabled={submittingReset}>
                  {submittingReset ? "در حال ذخیره..." : "تغییر رمز عبور"}
                </button>

                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => setCurrentStep(ForgotPasswordStep.VERIFY_CODE)}
                >
                  بازگشت
                </button>
              </div>
            </form>
          </FormProvider>
        )}

        {currentStep === ForgotPasswordStep.SUCCESS && (
          <div className={styles.successContainer}>
            <h2 className={styles.modalTitle}>تغییر رمز عبور با موفقیت انجام شد</h2>
            <p className={styles.modalDescription}>
              رمز عبور شما با موفقیت تغییر یافت. اکنون می‌توانید با رمز عبور جدید وارد شوید.
            </p>

            <button type="button" className={styles.submitButton} onClick={handleClose}>
              بازگشت به صفحه ورود
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
