import * as yup from "yup";

export const cities = [
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "اردبیل",
  "اصفهان",
  "البرز",
  "ایلام",
  "بوشهر",
  "تهران",
  "چهارمحال و بختیاری",
  "خراسان جنوبی",
  "خراسان رضوی",
  "خراسان شمالی",
  "خوزستان",
  "زنجان",
  "سمنان",
  "سیستان و بلوچستان",
  "فارس",
  "قزوین",
  "قم",
  "کردستان",
  "کرمان",
  "کرمانشاه",
  "کهگیلویه و بویراحمد",
  "گلستان",
  "گیلان",
  "لرستان",
  "مازندران",
  "مرکزی",
  "هرمزگان",
  "همدان",
  "یزد",
];

// !Auth Regex
const fNamePattern = /^[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\s]{3,20}$/;
const lNamePattern = /^[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\s]{3,30}$/;
const phoneNumberPattern = /^09\d{9}$/;
const jobPattern = /^[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\s]{3,30}$/;
const emailPattern = /^[A-Za-z0-9_!#$%&'*+=?`{|}~^.-]{5,50}@[A-Za-z0-9.-]{1,45}\.[A-Za-z]{2,4}$/;
const usernamePattern = /^[a-zA-Z_0-9]{3,30}$/;
const passwordPattern = /^[a-zA-Z0-9@!#$%^&*_+;:?]{8,50}$/;

// !SignUp schema

const signUpSchema = yup.object().shape({
  f_name: yup
    .string()
    .matches(fNamePattern, "نام باید بین ۳ تا ۲۰ کاراکتر فارسی باشد")
    .required("نام الزامی است"),
  l_name: yup
    .string()
    .matches(lNamePattern, "نام خانوادگی باید بین ۳ تا ۳۰ کاراکتر فارسی باشد")
    .required("نام خانوادگی الزامی است"),
  phone_number: yup
    .string()
    .matches(
      phoneNumberPattern,
      "شماره تلفن باید با 09 شروع شود و ۱۱ رقم باشد و با اعداد انگلیسی نوشته شده باشد"
    )
    .required("شماره تلفن همراه الزامی است"),
  job: yup
    .string()
    .matches(jobPattern, "شغل باید بین ۳ تا ۳۰ کاراکتر فارسی باشد")
    .required("شغل الزامی است"),
  email_address: yup
    .string()
    .matches(emailPattern, "آدرس ایمیل نامعتبر است")
    .required("آدرس ایمیل الزامی است"),
  city: yup
    .string()
    .oneOf(cities, "لطفا یک استان معتبر انتخاب کنید")
    .required("استان محل سکونت الزامی است"),
  username: yup
    .string()
    .matches(
      usernamePattern,
      "نام کاربری باید بین ۳ تا ۳۰ کاراکتر، بدون فاصله و شامل حروف انگلیسی باشد"
    )
    .required("نام کاربری الزامی است"),
  password: yup
    .string()
    .matches(passwordPattern, "کلمه عبور باید بین ۸ تا ۵۰ کاراکتر و شامل حروف انگلیسی و اعداد باشد")
    .required("کلمه عبور الزامی است"),
  secondPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "کلمه عبور باید مطابقت داشته باشد")
    .required("تکرار کلمه عبور الزامی است"),
});

// !SignIn schema

const signInSchema = yup.object().shape({
  username: yup
    .string()
    .matches(
      usernamePattern,
      "نام کاربری باید بین ۳ تا ۳۰ کاراکتر، بدون فاصله و شامل حروف فارسی یا انگلیسی باشد"
    )
    .required("نام کاربری الزامی است"),
  password: yup
    .string()
    .matches(passwordPattern, "کلمه عبور باید بین ۸ تا ۵۰ کاراکتر و شامل حروف و اعداد انگلیسی باشد")
    .required("کلمه عبور الزامی است")
    .min(8, "کلمه عبور نباید کمتر از ۸ کاراکتر باشد")
    .max(50, "کلمه عبور نباید بیش از ۵۰ کاراکتر باشد"),
});

// !ForgotPassword schema

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .matches(emailPattern, "آدرس ایمیل نامعتبر است")
    .required("آدرس ایمیل الزامی است"),
});

// !VerifyCode schema
const verifyCodeSchema = yup.object().shape({
  code: yup
    .string()
    .matches(/^\d{6}$/, "کد تایید باید ۶ رقم باشد")
    .required("کد تایید الزامی است"),
});

// !ResetPassword schema
const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .matches(passwordPattern, "کلمه عبور باید بین ۸ تا ۵۰ کاراکتر و شامل حروف و اعداد انگلیسی باشد")
    .required("کلمه عبور الزامی است")
    .min(8, "کلمه عبور نباید کمتر از ۸ کاراکتر باشد")
    .max(50, "کلمه عبور نباید بیش از ۵۰ کاراکتر باشد"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "کلمه عبور باید مطابقت داشته باشد")
    .required("تکرار کلمه عبور الزامی است"),
});

// !EditUser schema
const editUserSchema = yup.object().shape({
  f_name: yup
    .string()
    .matches(fNamePattern, "نام باید بین ۳ تا ۲۰ کاراکتر فارسی باشد")
    .required("نام الزامی است"),
  l_name: yup
    .string()
    .matches(lNamePattern, "نام خانوادگی باید بین ۳ تا ۳۰ کاراکتر فارسی باشد")
    .required("نام خانوادگی الزامی است"),
  phone_number: yup
    .string()
    .matches(
      phoneNumberPattern,
      "شماره تلفن باید با 09 شروع شود و ۱۱ رقم باشد و با اعداد انگلیسی نوشته شده باشد"
    )
    .required("شماره تلفن همراه الزامی است"),
  job: yup
    .string()
    .matches(jobPattern, "شغل باید بین ۳ تا ۳۰ کاراکتر فارسی باشد")
    .required("شغل الزامی است"),
  email_address: yup
    .string()
    .matches(emailPattern, "آدرس ایمیل نامعتبر است")
    .required("آدرس ایمیل الزامی است"),
  city: yup
    .string()
    .oneOf(cities, "لطفا یک استان معتبر انتخاب کنید")
    .required("استان محل سکونت الزامی است"),
});

// !ChangePassword schema
const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .matches(passwordPattern, "کلمه عبور باید بین ۸ تا ۵۰ کاراکتر و شامل حروف انگلیسی و اعداد باشد")
    .required("کلمه عبور الزامی است"),
  newPassword: yup
    .string()
    .matches(passwordPattern, "کلمه عبور جدید باید با کلمه عبور قبلی تفاوت داشته باشد")
    .required("کلمه عبور جدید الزامی است"),
});

export {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
  editUserSchema,
  changePasswordSchema,
};
