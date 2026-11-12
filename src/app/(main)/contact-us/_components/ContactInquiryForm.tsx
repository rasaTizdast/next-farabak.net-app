"use client";

import { useState } from "react";

type ContactInquiryFormProps = {
  recipient?: string;
};

type FormValues = {
  name: string;
  phone: string;
  project: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  phone: "",
  project: "",
  message: "",
};

const validate = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};
  const normalizedPhone = values.phone.replace(/[\s-]/g, "");

  if (values.name.trim().length < 2) errors.name = "نام و نام خانوادگی را وارد کنید.";
  if (!/^\+?[0-9۰-۹]{8,15}$/.test(normalizedPhone)) {
    errors.phone = "شماره تماس معتبر را وارد کنید.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "لطفاً نیاز یا پروژه خود را کمی دقیق‌تر توضیح دهید.";
  }

  return errors;
};

function ContactInquiryForm({ recipient }: ContactInquiryFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status !== "idle") setStatus("idle");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);

    if (Object.keys(nextErrors).length > 0 || !recipient) {
      setErrors(nextErrors);
      setStatus("error");
      return;
    }

    setStatus("submitting");
    window.setTimeout(() => {
      const subject = `درخواست مشاوره پروژه از ${values.name.trim()}`;
      const body = [
        `نام: ${values.name.trim()}`,
        `شماره تماس: ${values.phone.trim()}`,
        `نوع پروژه: ${values.project.trim() || "ذکر نشده"}`,
        "",
        values.message.trim(),
      ].join("\n");

      window.open(
        `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        "_self"
      );
      setStatus("success");
    }, 120);
  };

  return (
    <form aria-label="فرم درخواست مشاوره" className="space-y-5" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={errors.name}
          id="contact-name"
          label="نام و نام خانوادگی"
          value={values.name}
          onChange={(value) => updateField("name", value)}
        />
        <Field
          error={errors.phone}
          id="contact-phone"
          inputMode="tel"
          label="شماره تماس"
          value={values.phone}
          onChange={(value) => updateField("phone", value)}
        />
      </div>

      <Field
        id="contact-project"
        label="نوع پروژه یا تجهیز (اختیاری)"
        value={values.project}
        onChange={(value) => updateField("project", value)}
      />

      <div>
        <label
          htmlFor="contact-message"
          className="mb-2 block text-sm font-semibold text-(--farabak-ink-deep)"
        >
          شرح نیاز یا پروژه
        </label>
        <textarea
          id="contact-message"
          aria-describedby={errors.message ? "contact-message-error" : "contact-message-help"}
          aria-invalid={Boolean(errors.message)}
          className="min-h-36 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 leading-8 text-(--farabak-ink-deep) transition-colors outline-none placeholder:text-slate-400 focus:border-(--farabak-action-blue) focus:ring-2 focus:ring-(--farabak-action-blue)/20"
          placeholder="مثلاً محل پروژه، نوع ورودی یا تجهیزی که برای انتخاب آن به مشاوره نیاز دارید"
          value={values.message}
          onChange={(event) => updateField("message", event.target.value)}
        />
        {errors.message ? (
          <p
            id="contact-message-error"
            className="mt-2 text-sm font-medium text-red-700"
            role="alert"
          >
            {errors.message}
          </p>
        ) : (
          <p
            id="contact-message-help"
            className="mt-2 text-sm leading-7 text-(--farabak-ink-muted)"
          >
            اطلاعاتی که به انتخاب راهکار کمک می‌کند را بنویسید؛ لازم نیست مشخصات فنی را از قبل
            بدانید.
          </p>
        )}
      </div>

      {status === "error" && !recipient ? (
        <p className="rounded-2xl bg-red-50 p-4 text-sm leading-7 text-red-800" role="alert">
          آدرس ایمیل دریافت‌کننده در حال حاضر ثبت نشده است. از راه‌های تماس مستقیم استفاده کنید.
        </p>
      ) : null}
      {status === "submitting" ? (
        <p
          className="rounded-2xl bg-slate-100 p-4 text-sm leading-7 text-slate-700"
          role="status"
          aria-live="polite"
        >
          در حال آماده‌سازی پیام…
        </p>
      ) : null}
      {status === "success" ? (
        <p
          className="rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-800"
          role="status"
          aria-live="polite"
        >
          برنامه ایمیل شما آماده شد؛ پیام را بررسی و ارسال کنید.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-(--farabak-action-blue) px-5 py-3 font-semibold text-white transition-colors hover:bg-(--farabak-action-blue)/90 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
      >
        {status === "submitting" ? "در حال آماده‌سازی…" : "آماده‌سازی پیام"}
      </button>
    </form>
  );
}

type FieldProps = {
  error?: string;
  id: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  label: string;
  onChange: (value: string) => void;
  value: string;
};

function Field({ error, id, inputMode, label, onChange, value }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-(--farabak-ink-deep)">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-(--farabak-ink-deep) transition-colors outline-none placeholder:text-slate-400 focus:border-(--farabak-action-blue) focus:ring-2 focus:ring-(--farabak-action-blue)/20"
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { ContactInquiryForm };
