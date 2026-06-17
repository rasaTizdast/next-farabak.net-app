"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useApiMutation } from "@/hooks/useApiMutation";

import { useUser } from "@/context/UserContext";
import { signInSchema } from "@/helpers/validationSchema";

import ForgotPasswordModal from "../_components/ForgotPasswordModal";
import TextInput from "../_components/TextInput";
import styles from "../FormStyles.module.css";

const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const router = useRouter();
  const { mutate: login } = useApiMutation("post");

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
    setIsSubmitting(true);
    setErrorMessage("");

    const response = await login("/api/auth/login", data) as any;
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
        setErrorMessage(response.message || "خطا در فرایند ورود.");
      }
    } else {
      setErrorMessage("خطا در فرایند ورود.");
    }
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <div className={styles.form_parent}>
        <form className={styles.signin_form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.group}>
            <Link href="/">
              <Image
                width={2066}
                height={182}
                src="/Farabak_Logo.webp"
                className={styles.logo}
                alt="farabak logo"
              />
            </Link>
            <div className={styles.vr_line}></div>
            <div className={styles.col_group}>
              <h3>ورود به حساب کاربری</h3>
              <div>شرکت فرابک</div>
            </div>
          </div>

          <div className={styles.input_group}>
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
              className={styles.forgot}
              onClick={() => setIsForgotPasswordModalOpen(true)}
            >
              کلمه عبور خود را فراموش کرده‌اید؟
            </button>
            <input
              className={styles.login_submit}
              type="submit"
              value={isSubmitting ? "در حال ورود..." : "ورود به حساب کاربری"}
              disabled={isSubmitting}
              readOnly
              data-testid="submit-button"
            />
          </div>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          <div className={styles.b_group}>
            <div className={styles.or_line}>
              <div className={styles.text}>یا</div>
            </div>
            <div className={styles.new_user}>
              کاربر جدید هستید؟
              <Link className={styles.switch_form} href="/auth/signup">
                ثبت نام
              </Link>
            </div>
          </div>
        </form>

        <div className={styles.view}>
          <Image
            src="/signIn_image.svg"
            width={552}
            height={412}
            quality={100}
            alt="farabak-signIn-Image"
            style={{ display: "block" }}
          />
          <h3>با ورود به حساب کاربری خود، میتوانید از تمامی امکانات وبسایت استفاده کنید.</h3>
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
