"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";

import TextInput from "./TextInput";
import styles from "./ForgotPasswordModal.module.css";
import {
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} from "@/helpers/validationSchema";

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
const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>(
    ForgotPasswordStep.EMAIL
  );
  const [email, setEmail] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await axios.post("/api/auth/forgot-password", data);

      if (response.data.emailSent && response.data.resetToken) {
        setEmail(data.email);
        setResetToken(response.data.resetToken);
        setCurrentStep(ForgotPasswordStep.VERIFY_CODE);
      } else {
        setErrorMessage(response.data.message || "خطا در ارسال ایمیل");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data.error || "خطا در ارسال ایمیل");
      } else {
        setErrorMessage("خطا در ارسال ایمیل");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle verification code submission
  const handleCodeSubmit = async (data: { code: string }) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await axios.post("/api/auth/verify-reset-code", {
        email,
        code: data.code,
        resetToken,
      });

      if (response.data.valid) {
        setVerificationCode(data.code);
        setCurrentStep(ForgotPasswordStep.RESET_PASSWORD);
      } else {
        setErrorMessage(response.data.error || "کد تایید نامعتبر است");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data.error || "کد تایید نامعتبر است");
      } else {
        setErrorMessage("خطا در تایید کد");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset submission
  const handlePasswordSubmit = async (data: {
    password: string;
    confirmPassword: string;
  }) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await axios.post("/api/auth/reset-password", {
        email,
        code: verificationCode,
        newPassword: data.password,
        resetToken,
      });

      if (response.data.success) {
        setCurrentStep(ForgotPasswordStep.SUCCESS);
      } else {
        setErrorMessage(response.data.error || "خطا در بازیابی رمز عبور");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data.error || "خطا در بازیابی رمز عبور"
        );
      } else {
        setErrorMessage("خطا در بازیابی رمز عبور");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal and reset state
  const handleClose = () => {
    setCurrentStep(ForgotPasswordStep.EMAIL);
    setEmail("");
    setVerificationCode("");
    setResetToken("");
    setErrorMessage("");
    setIsSubmitting(false);
    emailMethods.reset();
    codeMethods.reset();
    passwordMethods.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={handleClose}>
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
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "در حال ارسال..." : "ارسال کد بازیابی"}
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
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "در حال تایید..." : "تایید کد"}
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
              <p className={styles.modalDescription}>
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

              {errorMessage && <p className={styles.error}>{errorMessage}</p>}

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "در حال ذخیره..." : "تغییر رمز عبور"}
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
            <h2 className={styles.modalTitle}>
              تغییر رمز عبور با موفقیت انجام شد
            </h2>
            <p className={styles.modalDescription}>
              رمز عبور شما با موفقیت تغییر یافت. اکنون می‌توانید با رمز عبور
              جدید وارد شوید.
            </p>

            <button
              type="button"
              className={styles.submitButton}
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
