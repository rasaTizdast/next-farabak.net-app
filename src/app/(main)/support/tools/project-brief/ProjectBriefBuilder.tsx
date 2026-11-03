"use client";

import { ArrowDown, ArrowLeft, Printer, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import {
  buildProjectBrief,
  preliminaryNote,
} from "@/features/support-tools/project-brief/build-brief";
import {
  briefFields,
  emptyProjectBrief,
  projectCategories,
  validateProjectBrief,
  type BriefField,
  type ProjectBriefInput,
} from "@/features/support-tools/project-brief/types";

const focusClasses =
  "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-right text-base leading-7 text-(--farabak-ink-deep) placeholder:text-slate-400 focus-visible:border-(--farabak-action-blue) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue)/30";

const descriptions: Partial<Record<BriefField["key"], string>> = {
  contactName: "اختیاری؛ برای استفاده شخصی از این برگه لازم نیست.",
  company: "اختیاری؛ در صورت نیاز نام سازمان را وارد کنید.",
  dimensions: "برای نمونه: ۱۲ دوربین یا فضای تقریبی ۲۰۰ مترمربع.",
  cctvRetention: "برای نمونه: حدود ۳۰ روز؛ فقط برآورد اولیه.",
  xrayObject: "برای نمونه: کیف دستی، بسته پستی یا کالای حجیم.",
  xrayFlow: "برای نمونه: تعداد افراد یا بسته‌ها در هر ساعت.",
  blackmagicFormat: "برای نمونه: وضوح تصویر، نرخ فریم یا نوع فایل ضبط.",
  roomDimensions: "طول و عرض تقریبی اتاق را با واحد بنویسید.",
  viewingDistance: "فاصله تقریبی از محل نشستن تا نمایشگر را وارد کنید.",
  connectivity: "برای نمونه: شبکه کابلی، بی‌سیم، HDMI یا SDI.",
  power: "برای نمونه: محل پریزها، برق پشتیبان یا محدودیت نصب.",
  timeline: "برای نمونه: زمان بازدید، نصب یا شروع بهره‌برداری.",
  openQuestions: "هر نکته‌ای که هنوز پاسخ آن را ندارید اینجا بنویسید.",
};

function Field({
  field,
  value,
  onChange,
}: {
  field: BriefField;
  value: string;
  onChange: (value: string) => void;
}) {
  const multiline = [
    "siteSetting",
    "requirements",
    "dimensions",
    "xrayObject",
    "xrayFlow",
    "blackmagicWorkflow",
    "openQuestions",
  ].includes(field.key);
  const id = `brief-${field.key}`;
  const hint = descriptions[field.key];
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-(--farabak-ink-deep)">
        {field.label} <span className="font-normal text-slate-500">(اختیاری)</span>
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={field.key === "openQuestions" ? 3 : 2}
          className={`${focusClasses} mt-2 resize-y`}
          placeholder={descriptions[field.key]}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      ) : (
        <input
          id={id}
          className={`${focusClasses} mt-2`}
          type="text"
          placeholder={descriptions[field.key]}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      )}
      {descriptions[field.key] ? (
        <p id={`${id}-hint`} className="mt-1 text-xs leading-6 text-(--farabak-ink-muted)">
          {descriptions[field.key]}
        </p>
      ) : null}
    </div>
  );
}

export default function ProjectBriefBuilder() {
  const [input, setInput] = useState<ProjectBriefInput>(emptyProjectBrief);
  const [attempted, setAttempted] = useState(false);
  const previewRef = useRef<HTMLElement>(null);
  const validity = validateProjectBrief(input);
  const brief = useMemo(() => buildProjectBrief(input), [input]);
  const relevantFields = briefFields.filter(
    (field) => !field.category || field.category === input.category
  );
  const completedRequired = Number(validity.category) + Number(validity.needDescription);

  function update<K extends keyof ProjectBriefInput>(key: K, value: ProjectBriefInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function jumpToPreview() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    previewRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "instant" : "smooth",
      block: "start",
    });
    if (prefersReducedMotion) {
      previewRef.current?.focus({ preventScroll: true });
    } else {
      window.setTimeout(() => previewRef.current?.focus({ preventScroll: true }), 250);
    }
  }

  function handlePrint() {
    setAttempted(true);
    if (!validity.category || !validity.needDescription) {
      document.getElementById(!validity.category ? "brief-category" : "brief-need")?.focus();
      return;
    }
    window.print();
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:px-5">
        <p aria-live="polite" className="text-sm text-(--farabak-ink-muted) print:hidden">
          {completedRequired} از ۲ مورد ضروری تکمیل شده
        </p>
        <button
          type="button"
          onClick={jumpToPreview}
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-(--farabak-action-blue) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue)"
        >
          پیش‌نمایش برگه <ArrowDown aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-10">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            handlePrint();
          }}
          className="space-y-5"
          aria-describedby="brief-local-note"
        >
          <p
            id="brief-local-note"
            className="rounded-lg bg-(--farabak-surface-blue) px-4 py-3 text-sm leading-7 text-(--farabak-ink-deep)"
          >
            این فرم هیچ اطلاعاتی را ذخیره یا ارسال نمی‌کند. با بستن یا تازه‌کردن صفحه، پاسخ‌ها پاک
            می‌شوند.
          </p>

          <fieldset className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <legend className="px-1 text-lg font-bold text-(--farabak-ink-deep)">نوع پروژه</legend>
            <p className="mt-1 text-xs text-(--farabak-ink-muted)">
              برای ساخت برگه، انتخاب این مورد ضروری است.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {projectCategories.map((category) => (
                <label
                  key={category.value}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-(--farabak-action-blue) motion-reduce:transition-none ${input.category === category.value ? "border-(--farabak-action-blue) bg-(--farabak-surface-blue) text-(--farabak-ink-deep)" : "border-slate-200 hover:border-slate-400"}`}
                >
                  <input
                    id={
                      category.value === projectCategories[0].value ? "brief-category" : undefined
                    }
                    type="radio"
                    name="project-category"
                    value={category.value}
                    checked={input.category === category.value}
                    onChange={() => update("category", category.value)}
                    className="size-4 accent-(--farabak-action-blue)"
                    aria-describedby={
                      attempted && !validity.category ? "category-error" : undefined
                    }
                  />
                  {category.label}
                </label>
              ))}
            </div>
            {attempted && !validity.category ? (
              <p id="category-error" role="alert" className="mt-2 text-sm text-red-700">
                یک دسته پروژه انتخاب کنید.
              </p>
            ) : null}
          </fieldset>

          <section
            aria-labelledby="need-heading"
            className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
          >
            <h2 id="need-heading" className="text-lg font-bold text-(--farabak-ink-deep)">
              نیاز اصلی
            </h2>
            <div className="mt-4">
              <label
                htmlFor="brief-need"
                className="text-sm font-semibold text-(--farabak-ink-deep)"
              >
                در یک یا دو جمله بگویید چه چیزی لازم دارید{" "}
                <span className="text-red-700">(ضروری)</span>
              </label>
              <textarea
                id="brief-need"
                rows={3}
                value={input.needDescription}
                onChange={(event) => update("needDescription", event.target.value)}
                className={`${focusClasses} mt-2 resize-y`}
                placeholder="برای نمونه: می‌خواهیم ورودی انبار را شبانه‌روزی پایش کنیم."
                aria-invalid={attempted && !validity.needDescription}
                aria-describedby={
                  attempted && !validity.needDescription ? "need-error" : "need-hint"
                }
              />
              <p id="need-hint" className="mt-1 text-xs text-(--farabak-ink-muted)">
                حداقل ۱۲ نویسه؛ بدون نیاز به درج اطلاعات شخصی.
              </p>
              {attempted && !validity.needDescription ? (
                <p id="need-error" role="alert" className="mt-2 text-sm text-red-700">
                  شرح نیاز را کمی کامل‌تر بنویسید.
                </p>
              ) : null}
            </div>
          </section>

          {input.category ? (
            <section
              aria-labelledby="details-heading"
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
            >
              <div>
                <h2 id="details-heading" className="text-lg font-bold text-(--farabak-ink-deep)">
                  جزئیات مرتبط با این پروژه
                </h2>
                <p className="mt-1 text-xs text-(--farabak-ink-muted)">
                  هر بخشی را که هنوز نمی‌دانید خالی بگذارید.
                </p>
              </div>
              {relevantFields.map((field) => (
                <Field
                  key={field.key}
                  field={field}
                  value={input[field.key]}
                  onChange={(value) => update(field.key, value)}
                />
              ))}
            </section>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-7 text-(--farabak-ink-muted)">
              با انتخاب نوع پروژه، فقط پرسش‌های مرتبط نمایش داده می‌شوند.
            </p>
          )}

          <div className="flex flex-wrap gap-3 print:hidden">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-(--farabak-action-blue) px-5 py-2 text-sm font-semibold text-white hover:bg-(--farabak-action-blue)/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue)"
            >
              <Printer aria-hidden="true" className="size-4" /> چاپ / ذخیره به PDF
            </button>
            <button
              type="button"
              onClick={() => {
                setInput(emptyProjectBrief);
                setAttempted(false);
                document.getElementById("brief-category")?.focus();
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-(--farabak-ink-deep) hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue)"
            >
              از نو شروع کنید <RotateCcw aria-hidden="true" className="size-4" />
            </button>
          </div>
        </form>

        <aside
          ref={previewRef}
          id="brief-preview"
          tabIndex={-1}
          aria-labelledby="preview-heading"
          className="scroll-mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) print:rounded-none print:border-0 print:p-0 print:shadow-none"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
            <div>
              <p className="text-xs font-semibold text-(--farabak-action-blue)">
                برگه در حال تکمیل
              </p>
              <h2 id="preview-heading" className="mt-1 text-xl font-bold text-(--farabak-ink-deep)">
                پیش‌نمایش شرح پروژه
              </h2>
            </div>
            <span
              aria-hidden="true"
              className="mt-1 size-3 rounded-full bg-(--farabak-action-blue)"
            />
          </div>
          <div className="brief-print-content prose prose-slate mt-4 max-w-none text-sm leading-8 whitespace-pre-wrap text-(--farabak-ink-deep) print:mt-0 print:text-black">
            {brief}
          </div>
          <p className="mt-5 border-t border-slate-200 pt-4 text-xs leading-6 text-(--farabak-ink-muted) print:hidden">
            {preliminaryNote}
          </p>
          <p className="mt-4 text-sm leading-7 text-(--farabak-ink-muted) print:hidden">
            برای ادامه گفت‌وگو با فرابک، این برگه را خودتان به پیام اضافه کنید یا متن آن را در صفحه
            تماس قرار دهید؛ چیزی خودکار ضمیمه یا ارسال نمی‌شود.
          </p>
          <Link
            href="/contact-us"
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-(--farabak-action-blue) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) print:hidden"
          >
            تماس با فرابک <ArrowLeft aria-hidden="true" className="size-4" />
          </Link>
        </aside>
      </div>
    </>
  );
}
