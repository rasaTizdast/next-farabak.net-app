"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";

import { signInSchema } from "@/helpers/validationSchema";
import TextInput from "../_components/TextInput";
import ForgotPasswordModal from "../_components/ForgotPasswordModal";
import styles from "../FormStyles.module.css";

import { useUser } from "@/context/UserContext";

const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const router = useRouter();

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
    setErrorMessage(""); // Clear previous errors

    try {
      const response = await axios.post("/api/auth/login", data);
      if (response.data.message === "ورود با موفقیت انجام شد") {
        updateUserContext();
        // Redirect based on user role
        const userRole = response.data.role;
        if (userRole === "Admin") {
          router.push("/admin");
        } else if (userRole === "Branch") {
          router.push("/admin/branches/my");
        } else {
          // Default case for regular users
          router.push("/dashboard");
        }
      } else {
        setErrorMessage(response.data.message || "خطا در فرایند ورود.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data.message || "خطا در فرایند ورود.");
      } else {
        setErrorMessage("خطا در فرایند ورود.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
            />
            <TextInput
              name="password"
              label="کلمه عبور"
              placeholder="کلمه عبور خود را وارد کنید"
              control={methods.control}
              errors={errors}
              type="password"
              autoComplete="current-password"
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
          <h3>
            با ورود به حساب کاربری خود، میتوانید از تمامی امکانات وبسایت استفاده
            کنید.
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
