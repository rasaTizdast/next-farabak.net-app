"use client";

import { useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

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
  if (!/^\+?[0-9۰-۹٠-٩]{8,15}$/.test(normalizedPhone)) {
    errors.phone = "شماره تماس معتبر را وارد کنید.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "لطفاً نیاز یا پروژه خود را کمی دقیق‌تر توضیح دهید.";
  }

  return errors;
};

function ContactInquiryForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const submittingRef = useRef(false);

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = validate(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    submittingRef.current = true;
    setStatus("submitting");
    setFormError(null);
    setErrors({});

    try {
      const response = await fetch("/api/contact-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          phone: values.phone.trim(),
          project: values.project.trim(),
          message: values.message.trim(),
          website,
        }),
      });
      if (response.status !== 201) throw new Error("Contact submission failed");

      setValues(initialValues);
      setWebsite("");
      toast.success("پیام شما ثبت شد. حداکثر تا ۲۴ ساعت آینده با شما تماس می‌گیریم.");
    } catch {
      setFormError("ارسال پیام انجام نشد. لطفاً دوباره تلاش کنید.");
      toast.error("ثبت پیام انجام نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      submittingRef.current = false;
      setStatus("idle");
    }
  };

  return (
    <>
      <form
        aria-label="فرم درخواست مشاوره"
        className="space-y-5"
        noValidate
        onSubmit={handleSubmit}
      >
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

        <div
          aria-hidden="true"
          className="absolute top-auto left-[-10000px] size-px overflow-hidden"
        >
          <label htmlFor="contact-website">Website</label>
          <input
            autoComplete="off"
            id="contact-website"
            name="website"
            tabIndex={-1}
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>

        {status === "submitting" ? (
          <p className="text-sm text-slate-600" role="status" aria-live="polite">
            در حال ارسال پیام…
          </p>
        ) : null}
        {formError ? (
          <p className="rounded-2xl bg-red-50 p-4 text-sm leading-7 text-red-800" role="alert">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-(--farabak-action-blue) px-5 py-3 font-semibold text-white transition-colors hover:bg-(--farabak-action-blue)/90 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
        >
          {status === "submitting" ? "در حال ارسال…" : "ارسال پیام"}
        </button>
      </form>
      <Toaster position="bottom-center" />
    </>
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
