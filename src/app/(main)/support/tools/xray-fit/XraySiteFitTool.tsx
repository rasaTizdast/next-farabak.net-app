"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { downloadToolReportPdf } from "@/features/support-tools/pdf/download-tool-report";
import { scannerCatalog } from "@/features/support-tools/xray-fit/catalog";
import { describeFlowRequirement, assessScannerFit } from "@/features/support-tools/xray-fit/fit";
import type { FieldKey, SiteFitInput } from "@/features/support-tools/xray-fit/types";

type Unit = "mm" | "cm";
const initialInput: SiteFitInput = {
  objectWidthMm: null,
  objectHeightMm: null,
  objectDepthMm: null,
  clearanceMm: null,
  entranceWidthMm: null,
  entranceHeightMm: null,
  pathWidthMm: null,
  pathHeightMm: null,
  placementWidthMm: null,
  placementLengthMm: null,
  placementHeightMm: null,
  handlingClearanceMm: null,
  requiredItemsPerHour: null,
  setting: "",
  notes: "",
};

const groups: {
  title: string;
  description: string;
  fields: { key: FieldKey; label: string; hint?: string; step?: string }[];
}[] = [
  {
    title: "۱. بزرگ‌ترین قلم",
    description: "بزرگ‌ترین شیء را در وضعیتی که وارد دستگاه می‌شود اندازه بگیرید.",
    fields: [
      { key: "objectWidthMm", label: "عرض قلم" },
      { key: "objectHeightMm", label: "ارتفاع قلم" },
      { key: "objectDepthMm", label: "عمق یا طول قلم" },
      {
        key: "clearanceMm",
        label: "فاصله آزاد لازم در هر طرف",
        hint: "فاصله‌ای که خودتان برای جابه‌جایی و عبور لازم می‌دانید.",
      },
    ],
  },
  {
    title: "۲. ورودی و مسیر تحویل",
    description: "باریک‌ترین بخش مسیر از محل تخلیه تا جای دستگاه را وارد کنید.",
    fields: [
      { key: "entranceWidthMm", label: "عرض ورودی ساختمان" },
      { key: "entranceHeightMm", label: "ارتفاع ورودی ساختمان" },
      { key: "pathWidthMm", label: "کمترین عرض مسیر" },
      { key: "pathHeightMm", label: "کمترین ارتفاع مسیر" },
      {
        key: "handlingClearanceMm",
        label: "فضای آزاد برای جابه‌جایی دستگاه",
        hint: "فضای اضافهٔ موردنیاز شما هنگام حمل و چرخاندن دستگاه.",
      },
    ],
  },
  {
    title: "۳. فضای استقرار",
    description: "فضای آزاد قابل اختصاص به بدنهٔ دستگاه را ثبت کنید.",
    fields: [
      { key: "placementWidthMm", label: "عرض فضای نصب" },
      { key: "placementLengthMm", label: "طول فضای نصب" },
      { key: "placementHeightMm", label: "ارتفاع آزاد محل نصب" },
    ],
  },
  {
    title: "۴. حجم کار",
    description:
      "نرخ اوج را به‌عنوان نیاز پروژه ثبت کنید؛ این ابزار ظرفیت دستگاه را از سرعت نوار محاسبه نمی‌کند.",
    fields: [{ key: "requiredItemsPerHour", label: "نرخ اوج موردنیاز، قلم در ساعت", step: "1" }],
  },
];

function displayDimension(value: number | null) {
  return value === null ? "ثبت نشده" : `${value.toLocaleString("fa-IR")} میلی‌متر`;
}

export default function XraySiteFitTool() {
  const [unit, setUnit] = useState<Unit>("cm");
  const [input, setInput] = useState(initialInput);
  const [activeGroup, setActiveGroup] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [saved, setSaved] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const multiplier = unit === "cm" ? 10 : 1;
  const fieldValue = (key: FieldKey) => {
    const value = input[key];
    return value === null
      ? ""
      : String(key === "requiredItemsPerHour" ? value : value / multiplier);
  };
  const dimensionsEntered = useMemo(
    () =>
      Object.entries(input).filter(
        ([key, value]) => key !== "requiredItemsPerHour" && typeof value === "number"
      ).length,
    [input]
  );
  const results = useMemo(
    () => scannerCatalog.map((facts) => ({ facts, result: assessScannerFit(input, facts) })),
    [input]
  );

  function updateField(key: FieldKey, value: string) {
    if (!/^\d*(?:\.\d*)?$/.test(value)) return;
    const parsed =
      value === "" ? null : Number(value) * (key === "requiredItemsPerHour" ? 1 : multiplier);
    setInput((current) => ({ ...current, [key]: parsed }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaved(false);
  }

  function saveBrief(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    for (const group of groups) {
      for (const field of group.fields) {
        const value = input[field.key];
        if (value !== null && (value <= 0 || !Number.isFinite(value)))
          nextErrors[field.key] = "عدد باید بزرگ‌تر از صفر باشد.";
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setSaved(true);
    } else {
      const firstInvalidGroup = groups.findIndex((group) =>
        group.fields.some((field) => nextErrors[field.key])
      );
      if (firstInvalidGroup >= 0) setActiveGroup(firstInvalidGroup);
    }
  }

  async function exportPdf() {
    if (!saved || isExportingPdf) return;
    const format = (value: number | null, unitName = "میلی‌متر") =>
      value === null ? "ثبت نشده" : `${value.toLocaleString("fa-IR")} ${unitName}`;
    const statusText = (status: string) =>
      status === "fits"
        ? "ابعاد شناخته‌شده در محدوده است"
        : status === "does-not-fit"
          ? "عدم تطبیق ابعاد شناخته‌شده"
          : "نیازمند بررسی تخصصی";
    setIsExportingPdf(true);
    setPdfError("");
    try {
      const modelSections = results.map(({ facts, result }) => ({
        title: `${facts.name} — ${statusText(result.status)}`,
        rows: [
          { label: "عرض دهانهٔ اعلام‌شده", value: format(facts.tunnelWidthMm) },
          { label: "ارتفاع دهانه", value: format(facts.tunnelHeightMm) },
          {
            label: "ابعاد بدنه (عرض × ارتفاع × طول)",
            value: `${format(facts.outerWidthMm)} × ${format(facts.outerHeightMm)} × ${format(facts.outerLengthMm)}`,
          },
          { label: "منبع مشخصات سازنده", value: facts.sourceUrl },
          { label: "تاریخ بررسی منبع", value: facts.checkedOn },
        ],
        paragraphs: [
          ...result.passed.map((item) => `تطبیق ابعاد: ${item}`),
          ...result.failed.map((item) => `عدم تطبیق: ${item}`),
          ...result.missing.map((item) => `نیازمند بررسی: ${item}`),
          facts.tunnelWidthIsMaximumAtConveyorEdge
            ? "عرض دهانهٔ منتشرشده بیشینهٔ اندازه‌گیری در لبهٔ نوار است؛ عرض مفید در ارتفاع قلم تأیید نشده است."
            : "",
        ].filter(Boolean),
      }));
      await downloadToolReportPdf({
        title: "خلاصهٔ بررسی اولیهٔ تناسب محل دستگاه X-ray",
        subtitle: "ابعاد محل و مسیر حمل با مشخصات منتشرشدهٔ مدل‌های فهرست‌شده مقایسه شده‌اند",
        fileName: "farabak-xray-site-fit.pdf",
        metrics: [
          { label: "مدل‌های مقایسه‌شده", value: results.length.toLocaleString("fa-IR") },
          { label: "نرخ اوج موردنیاز", value: format(input.requiredItemsPerHour, "قلم در ساعت") },
        ],
        pages: [
          [
            {
              title: "مشخصات محل و اقلام",
              rows: [
                {
                  label: "بزرگ‌ترین قلم (عرض × ارتفاع × عمق)",
                  value: `${format(input.objectWidthMm)} × ${format(input.objectHeightMm)} × ${format(input.objectDepthMm)}`,
                },
                { label: "فاصلهٔ آزاد هر طرف", value: format(input.clearanceMm) },
                {
                  label: "ورودی ساختمان (عرض × ارتفاع)",
                  value: `${format(input.entranceWidthMm)} × ${format(input.entranceHeightMm)}`,
                },
                {
                  label: "مسیر تحویل (عرض × ارتفاع)",
                  value: `${format(input.pathWidthMm)} × ${format(input.pathHeightMm)}`,
                },
                {
                  label: "فضای نصب (عرض × طول × ارتفاع)",
                  value: `${format(input.placementWidthMm)} × ${format(input.placementLengthMm)} × ${format(input.placementHeightMm)}`,
                },
                { label: "فضای آزاد جابه‌جایی دستگاه", value: format(input.handlingClearanceMm) },
                { label: "نوع محل", value: input.setting || "ثبت نشده" },
              ],
              paragraphs: input.notes ? [`یادداشت: ${input.notes}`] : [],
            },
            {
              title: "توصیف نیاز عملیاتی",
              paragraphs: [describeFlowRequirement(input.requiredItemsPerHour)],
            },
          ],
          ...modelSections.map((section) => [section]),
        ],
        disclaimer:
          "این ابزار یک پیش‌بررسی بر پایهٔ اطلاعات واردشده و ابعاد منتشرشده است؛ ارتفاع و عرض مفید دهانه، الزامات نصب، استانداردها و تناسب عملیاتی باید با سازنده و کارشناس محل تأیید شوند.",
      });
    } catch {
      setPdfError("ساخت فایل PDF انجام نشد. دوباره تلاش کنید.");
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-start">
      <form
        onSubmit={saveBrief}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        noValidate
      >
        <div className="rounded-xl bg-slate-50 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-(--farabak-action-blue)">بازدید محل</p>
              <p className="mt-1 text-sm font-semibold text-(--farabak-ink-deep)">
                مرحلهٔ {String(activeGroup + 1).padStart(2, "0")} از {groups.length} ·{" "}
                {groups[activeGroup].title.replace(/^[۰-۹\d]+\.\s*/, "")}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
              {dimensionsEntered} اندازه ثبت شده
            </span>
          </div>
          <div className="mt-4 flex gap-1.5" aria-hidden="true">
            {groups.map((group, index) => (
              <span
                key={group.title}
                className={`h-1.5 flex-1 rounded-full ${index <= activeGroup ? "bg-(--farabak-action-blue)" : "bg-slate-200"}`}
              />
            ))}
          </div>
          <nav aria-label="مراحل ثبت اطلاعات" className="mt-3 grid grid-cols-4 gap-1.5">
            {groups.map((group, index) => (
              <button
                key={group.title}
                type="button"
                aria-current={index === activeGroup ? "step" : undefined}
                onClick={() => setActiveGroup(index)}
                className={`min-h-10 rounded-md px-1 text-[11px] leading-5 font-semibold focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none sm:text-xs ${index === activeGroup ? "bg-white text-(--farabak-ink-deep) shadow-sm" : "text-slate-500 hover:bg-white/70"}`}
              >
                {index + 1}. {group.title.replace(/^[۰-۹\d]+\.\s*/, "")}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <p className="text-sm text-(--farabak-ink-muted)">واحد اندازه‌گیری ابعاد</p>
          <div
            className="inline-flex rounded-lg border border-slate-300 p-1"
            role="group"
            aria-label="واحد اندازه‌گیری"
          >
            {(["cm", "mm"] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                aria-pressed={unit === choice}
                onClick={() => setUnit(choice)}
                className="min-h-10 min-w-14 rounded-md px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) aria-pressed:bg-(--farabak-ink-deep) aria-pressed:text-white"
              >
                {choice === "cm" ? "سانتی‌متر" : "میلی‌متر"}
              </button>
            ))}
          </div>
        </div>
        {groups.slice(activeGroup, activeGroup + 1).map((group) => (
          <fieldset key={group.title} className="border-t-2 border-(--farabak-ink-deep) pt-4">
            <legend className="px-1 text-lg font-bold text-(--farabak-ink-deep)">
              {group.title}
            </legend>
            <p className="mb-4 text-sm leading-7 text-(--farabak-ink-muted)">{group.description}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.fields.map((field) => {
                const error = errors[field.key];
                const id = `xray-${field.key}`;
                return (
                  <div
                    key={field.key}
                    className={field.key === "requiredItemsPerHour" ? "sm:col-span-2" : ""}
                  >
                    <label htmlFor={id} className="text-sm font-semibold text-slate-800">
                      {field.label}
                      {field.key !== "requiredItemsPerHour"
                        ? `، ${unit === "cm" ? "سانتی‌متر" : "میلی‌متر"}`
                        : ""}
                    </label>
                    {field.hint && (
                      <p id={`${id}-hint`} className="mt-1 text-xs leading-6 text-slate-600">
                        {field.hint}
                      </p>
                    )}
                    <input
                      id={id}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step={field.step ?? "any"}
                      value={fieldValue(field.key)}
                      onChange={(event) => updateField(field.key, event.target.value)}
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        [field.hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
                          .filter(Boolean)
                          .join(" ") || undefined
                      }
                      className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 focus-visible:border-(--farabak-action-blue) focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue)/30 focus-visible:outline-none"
                    />
                    {error && (
                      <p
                        id={`${id}-error`}
                        role="alert"
                        className="mt-1 text-sm font-semibold text-red-800"
                      >
                        {error}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
        {activeGroup === groups.length - 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="xray-setting" className="text-sm font-semibold">
                نوع محل
              </label>
              <select
                id="xray-setting"
                value={input.setting}
                onChange={(event) => {
                  setInput((current) => ({ ...current, setting: event.target.value }));
                  setSaved(false);
                }}
                className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue)"
              >
                <option value="">انتخاب کنید</option>
                <option>میز تحویل مرسوله</option>
                <option>ورودی یا ایست بازرسی</option>
                <option>محیط صنعتی</option>
                <option>سایر</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="xray-notes" className="text-sm font-semibold">
                توضیحات تکمیلی
              </label>
              <textarea
                id="xray-notes"
                rows={3}
                value={input.notes}
                onChange={(event) => {
                  setInput((current) => ({ ...current, notes: event.target.value }));
                  setSaved(false);
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-base focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue)"
              />
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            disabled={activeGroup === 0}
            onClick={() => setActiveGroup((step) => Math.max(0, step - 1))}
            className="min-h-12 rounded-lg px-4 font-semibold text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            مرحلهٔ قبل
          </button>
          <div className="flex flex-wrap gap-3">
            {activeGroup < groups.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveGroup((step) => Math.min(groups.length - 1, step + 1))}
                className="min-h-12 rounded-lg bg-(--farabak-action-blue) px-5 font-semibold text-white hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue)"
              >
                ادامه به مرحلهٔ بعد
              </button>
            ) : (
              <button
                type="submit"
                className="min-h-12 rounded-md bg-(--farabak-action-blue) px-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue)"
              >
                به‌روزرسانی خلاصه
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setInput(initialInput);
                setErrors({});
                setSaved(false);
                setActiveGroup(0);
              }}
              className="min-h-12 rounded-md border border-slate-300 bg-white px-5 font-semibold text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue)"
            >
              شروع دوباره
            </button>
          </div>
        </div>
      </form>

      <aside
        aria-labelledby="xray-result-title"
        className="min-w-0 rounded-xl border border-t-4 border-slate-200 border-t-(--farabak-action-blue) bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-6"
      >
        <div aria-live="polite" aria-atomic="true">
          <p className="text-sm font-semibold text-(--farabak-action-blue)">خلاصهٔ محل و مسیر</p>
          <h2 id="xray-result-title" className="mt-2 text-2xl font-bold text-(--farabak-ink-deep)">
            مقایسهٔ مقدماتی مدل‌های دارای مشخصات منتشرشده
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            ابعاد منتشرشدهٔ سازنده مقایسه می‌شوند؛ نبودن ارتفاع دهانه یا جزئیات نصب به معنی نیاز به
            بررسی است.
          </p>
        </div>
        <figure
          className="mt-6 rounded-xl border border-slate-200 bg-white p-4"
          aria-labelledby="xray-diagram-caption"
        >
          <figcaption id="xray-diagram-caption" className="text-sm font-bold text-slate-800">
            مسیر اندازه‌گیری: قلم ← دهانهٔ دستگاه ← مسیر و محل نصب
          </figcaption>
          <div className="mt-4 grid grid-cols-3 items-stretch gap-2 text-center text-xs leading-6 font-semibold sm:text-sm">
            <div className="flex min-h-24 flex-col items-center justify-center border-2 border-dashed border-slate-500 p-2">
              <span>قلم</span>
              <span>عرض: {displayDimension(input.objectWidthMm)}</span>
              <span>ارتفاع: {displayDimension(input.objectHeightMm)}</span>
            </div>
            <div className="flex min-h-24 flex-col items-center justify-center border-x-4 border-y-2 border-(--farabak-ink-deep) bg-slate-100 p-2">
              <span>دهانه</span>
              <span>عرض مفید و ارتفاع: نیازمند تأیید</span>
            </div>
            <div className="flex min-h-24 flex-col items-center justify-center border-2 border-(--farabak-action-blue) p-2">
              <span>مسیر / محل</span>
              <span>مسیر: {displayDimension(input.pathWidthMm)}</span>
              <span>عرض نصب: {displayDimension(input.placementWidthMm)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-600">
            نمای شماتیک است و مقیاس واقعی را نشان نمی‌دهد. وضعیت: بررسی متخصص لازم است.
          </p>
        </figure>
        <section className="mt-6" aria-labelledby="xray-candidates-title">
          <h3 id="xray-candidates-title" className="font-bold text-(--farabak-ink-deep)">
            نتیجه برای مدل‌های فهرست‌شده
          </h3>
          <ul className="mt-3 space-y-4">
            {results.map(({ facts, result }) => (
              <li
                key={facts.productId}
                className="border-r-2 border-(--farabak-action-blue) bg-white p-4"
              >
                <h4 className="font-bold">
                  <Link
                    className="text-(--farabak-action-blue) underline underline-offset-4"
                    href={facts.href}
                  >
                    <bdi dir="ltr">{facts.name}</bdi>
                  </Link>{" "}
                  —{" "}
                  {result.status === "does-not-fit"
                    ? "عدم تطبیق ابعاد شناخته‌شده"
                    : result.status === "fits"
                      ? "ابعاد شناخته‌شده در محدوده است"
                      : "نیازمند بررسی"}
                </h4>
                <p className="mt-2 text-sm leading-7">
                  عرض اعلام‌شدهٔ دهانه: {facts.tunnelWidthMm?.toLocaleString("fa-IR")} میلی‌متر
                  (بیشینه در لبهٔ نوار؛ ابعاد مفید در ارتفاع قلم تأیید نشده)؛ ارتفاع دهانه در منبع
                  نیامده است. ابعاد بدنه، عرض × ارتفاع × طول:{" "}
                  {facts.outerWidthMm?.toLocaleString("fa-IR")} ×{" "}
                  {facts.outerHeightMm?.toLocaleString("fa-IR")} ×{" "}
                  {facts.outerLengthMm?.toLocaleString("fa-IR")} میلی‌متر.
                </p>
                {result.passed.map((reason) => (
                  <p key={reason} className="mt-2 text-sm font-semibold">
                    تطبیق ابعاد: {reason}
                  </p>
                ))}
                {result.failed.map((reason) => (
                  <p key={reason} className="mt-2 text-sm font-semibold text-red-800">
                    عدم تطبیق: {reason}
                  </p>
                ))}
                {result.missing.map((reason) => (
                  <p key={reason} className="mt-2 text-sm">
                    نیازمند بررسی: {reason}
                  </p>
                ))}
              </li>
            ))}
          </ul>
          {results.length === 0 && (
            <p className="mt-2 text-sm leading-7">
              هیچ مدل فهرست‌شده با ابعاد قابل استناد ثبت نشده است. اطلاعات محل را ثبت کنید تا
              به‌عنوان خلاصهٔ بازدید استفاده شود؛ ارزیابی دستگاه پس از دریافت مشخصات سازنده انجام
              می‌شود.
            </p>
          )}
        </section>
        <section className="mt-6" aria-labelledby="xray-measurements-title">
          <h3 id="xray-measurements-title" className="font-bold text-(--farabak-ink-deep)">
            اطلاعات واردشده
          </h3>
          <dl className="mt-3 divide-y divide-slate-200 border-y border-slate-200 text-sm">
            {(
              [
                [
                  "بزرگ‌ترین قلم",
                  `${displayDimension(input.objectWidthMm)} × ${displayDimension(input.objectHeightMm)} × ${displayDimension(input.objectDepthMm)}`,
                ],
                [
                  "ورودی",
                  `${displayDimension(input.entranceWidthMm)} × ${displayDimension(input.entranceHeightMm)}`,
                ],
                [
                  "مسیر تحویل",
                  `${displayDimension(input.pathWidthMm)} × ${displayDimension(input.pathHeightMm)}`,
                ],
                [
                  "فضای نصب",
                  `${displayDimension(input.placementWidthMm)} × ${displayDimension(input.placementLengthMm)} × ${displayDimension(input.placementHeightMm)}`,
                ],
                ["محدوده", input.setting || "ثبت نشده"],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[minmax(88px,0.5fr)_minmax(0,1fr)] gap-3 py-3"
              >
                <dt className="font-semibold text-slate-700">{label}</dt>
                <dd className="wrap-break-word text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            {describeFlowRequirement(input.requiredItemsPerHour)}
          </p>
          {input.notes && (
            <p className="mt-3 text-sm leading-7 whitespace-pre-wrap text-slate-700">
              یادداشت: {input.notes}
            </p>
          )}
          <p className="mt-4 text-xs text-slate-600">
            تعداد فیلدهای عددی تکمیل‌شده: {dimensionsEntered.toLocaleString("fa-IR")}
          </p>
        </section>
        <p className="mt-5 border-r-2 border-slate-400 pr-3 text-xs leading-7 text-slate-700">
          ابعاد ورودی، چرخش و جابه‌جایی دستگاه، سازه و تأسیسات محل، استانداردهای مربوط، نوع اقلام،
          ظرفیت واقعی خط و گردش کار اپراتور باید در بازدید و بررسی تخصصی تأیید شوند.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 print:hidden">
          <button
            type="button"
            onClick={exportPdf}
            disabled={!saved || isExportingPdf}
            className="min-h-11 rounded-md bg-(--farabak-ink-deep) px-4 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingPdf ? "در حال ساخت PDF…" : "دانلود گزارش PDF"}
          </button>
          <Link
            href="/contact-us"
            className="inline-flex min-h-11 items-center rounded-md border border-slate-400 bg-white px-4 font-semibold text-(--farabak-ink-deep) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue)"
          >
            گفت‌وگو با کارشناس
          </Link>
        </div>
        {pdfError ? (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {pdfError}
          </p>
        ) : null}
        {!saved && (
          <p className="mt-3 text-xs leading-6 text-slate-600 print:hidden">
            برای فعال‌شدن خروجی PDF، ابتدا «به‌روزرسانی خلاصه» را بزنید.
          </p>
        )}
      </aside>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          aside[aria-labelledby="xray-result-title"],
          aside[aria-labelledby="xray-result-title"] * {
            visibility: visible !important;
          }
          aside[aria-labelledby="xray-result-title"] {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            border: 0 !important;
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
