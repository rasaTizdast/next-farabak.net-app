"use client";
import Image from "next/image";
import Link from "next/link"; // You can use Link from Next.js as well
import { useRouter } from "next/navigation"; // Next.js routing
import { useState } from "react";

import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";

import CitySelector from "@/app/auth/_components/CitySelector";
import TextInput from "@/app/auth/_components/TextInput";

import { signUpSchema } from "@/helpers/validationSchema"; // Import schema from helper
import { useUser } from "@/context/UserContext";

import signUpImage from "/public/signUp_image.svg"; // Adjust asset paths
import farabakLogo from "/public/Farabak_Logo.webp"; // Logo path

import styles from "../FormStyles.module.css"; // Adjust CSS import

// Define the types for form fields
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter(); // Next.js router

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

    setIsSubmitting(true);
    setErrorMessage(""); // Clear previous errors

    try {
      // Call the signup API using axios
      const response = await axios.post("/api/auth/signup", signUpData);
      if (response.data.message === "ثبت نام با موفقیت انجام شد") {
        updateUserContext();
        // Redirect to the dashboard on success
        router.push("/dashboard");
      } else {
        setErrorMessage(response.data.message || "خطا در فرایند ثبت‌نام.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data.message || "خطا در فرایند ثبت‌نام."
        );
      } else {
        setErrorMessage("خطا در فرایند ثبت‌نام.");
      }
    } finally {
      setIsSubmitting(false);
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
      <div className={styles.form_parent}>
        <form className={styles.signup_form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.group}>
            <Link href="/">
              <Image
                width={2066}
                height={182}
                src={farabakLogo.src}
                className={styles.logo}
                alt="farabak logo"
              />
            </Link>
            <div className={styles.vr_line}></div>
            <div className={styles.col_group}>
              <h3>ساخت حساب کاربری</h3>
              <div>شرکت فرابک</div>
            </div>
          </div>

          {step === 1 && (
            <div className={`${styles.step} ${styles.active}`}>
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
            <div className={`${styles.step} ${styles.active}`}>
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
            <div className={`${styles.step} ${styles.active}`}>
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
            value={isSubmitting ? "در حال ورود..." : "ورود به حساب کاربری"}
            disabled={isSubmitting || step !== 3}
            className={`${styles.signup_submit} ${
              step !== 3 ? styles.disable : ""
            }`}
          />

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.button}
              id="prev"
              onClick={prevStep}
              disabled={step === 1}
            >
              قبلی
            </button>
            <button
              type="button"
              className={styles.button}
              id="next"
              onClick={nextStep}
              disabled={step === 3}
            >
              بعدی
            </button>
          </div>
          <div className={styles.b_group}>
            <div className={styles.or_line}>
              <div className={styles.text}>یا</div>
            </div>
            <div className={styles.user}>
              حساب کاربری دارید؟
              <Link href="/auth/login" className={styles.switch_form}>
                ورود به حساب کاربری
              </Link>
            </div>
          </div>
        </form>
        <div className={styles.view}>
          <Image
            src={signUpImage.src}
            alt="farabak-signUp-Image"
            width={552}
            height={412}
            quality={100}
            style={{ display: "block" }}
          />
          <h3>
            با ساخت حساب کاربری خود، میتوانید از تمامی امکانات وبسایت استفاده
            کنید.
          </h3>
        </div>
      </div>
    </FormProvider>
  );
};

export default SignUp;
