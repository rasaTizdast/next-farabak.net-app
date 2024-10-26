"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";

import { signInSchema } from "@/helpers/validationSchema";
import TextInput from "../_components/TextInput";
import styles from "../FormStyles.module.css";

import signInImage from "/public/signIn_image.svg";
import farabakLogo from "/public/Farabak_Logo.webp";
import Image from "next/image";
import axios from "axios";

const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
      const response = await axios.post("/api/auth/login", { data });
      if (response.data.message === "Login successful") {
        // Redirect to the dashboard on success
        router.push("/dashboard");
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
                src={farabakLogo}
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
            {/* <Link to="/auth/forgot-password" className={styles.forgot}>
              کلمه عبور خود را فراموش کرده‌اید؟
            </Link> */}
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
            src={signInImage}
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
    </FormProvider>
  );
};

export default SignIn;
