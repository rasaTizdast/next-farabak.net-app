"use client";

import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { blackmagicRateFacts } from "@/features/support-tools/blackmagic-record-time/data";
import { calculateRecordingPlan } from "@/features/support-tools/blackmagic-record-time/calculation";
import type { BlackmagicQuality } from "@/features/support-tools/blackmagic-record-time/types";

const numberFormat = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });
const preciseFormat = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });
const asNumber = (value: string) => (value.trim() === "" ? Number.NaN : Number(value));
const controlClass =
  "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-(--farabak-ink-deep) outline-none focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2";

const models = [
  { slug: "pyxis-12k", label: "Blackmagic PYXIS 12K", productHref: "/products/blackmagic/camera/pyxis-12k" },
  { slug: "pyxis-12k-ef", label: "Blackmagic PYXIS 12K EF", productHref: null },
  { slug: "pyxis-12k-pl", label: "Blackmagic PYXIS 12K PL", productHref: null },
  { slug: "pyxis-6k", label: "Blackmagic PYXIS 6K", productHref: null },
  { slug: "pyxis-6k-ef", label: "Blackmagic PYXIS 6K EF", productHref: null },
  { slug: "pyxis-6k-pl", label: "Blackmagic PYXIS 6K PL", productHref: null },
] as const;

export default function BlackmagicRecordTimeTool({ productHref }: { productHref: string | null }) {
  const [modelSlug, setModelSlug] = useState<string>(models[0].slug);
  const [format, setFormat] = useState("۱۲K، ۱۲۲۸۸ × ۸۰۴۰");
  const [frameRate, setFrameRate] = useState("24");
  const [quality, setQuality] = useState<BlackmagicQuality>("constant-bitrate");
  const [compression, setCompression] = useState("8:1");
  const [capacity, setCapacity] = useState("1000");
  const [customCapacity, setCustomCapacity] = useState("1000");
  const [cardCount, setCardCount] = useState("2");
  const [shootMinutes, setShootMinutes] = useState("120");
  const [safetyMargin, setSafetyMargin] = useState("20");

  const fact = blackmagicRateFacts.find(
    (item) =>
      item.modelSlug === modelSlug &&
      item.format === format &&
      item.frameRate === Number(frameRate) &&
      item.quality === quality &&
      item.compression === compression
  );
  const plan = useMemo(() => {
    if (!fact) return null;
    return calculateRecordingPlan({
      capacityGb: asNumber(capacity === "custom" ? customCapacity : capacity),
      cardCount: asNumber(cardCount),
      rateMbPerSecond: fact.maximumMbPerSecond,
      durationMinutes: asNumber(shootMinutes),
      safetyMarginPercent: asNumber(safetyMargin),
    });
  }, [capacity, cardCount, customCapacity, fact, safetyMargin, shootMinutes]);

  const capacityOptions = [
    [256, "۲۵۶ گیگابایت"],
    [512, "۵۱۲ گیگابایت"],
    [1000, "۱ ترابایت"],
    [2000, "۲ ترابایت"],
    [4000, "۴ ترابایت"],
    [8000, "۸ ترابایت"],
  ] as const;
  const availableCompressions = blackmagicRateFacts
    .filter((item) => item.modelSlug === modelSlug && item.format === format && item.quality === quality)
    .map((item) => item.compression);
  const availableFormats = modelSlug === "pyxis-12k" ? ["۱۲K، ۱۲۲۸۸ × ۸۰۴۰"] : ["اطلاعات این مدل موجود نیست"];
  const availableFrameRates = ["24", "25", "30"];
  const selectedModel = models.find((item) => item.slug === modelSlug) ?? models[0];
  const selectedCapacity = asNumber(capacity === "custom" ? customCapacity : capacity);
  const maxCardsValid = Number.isInteger(asNumber(cardCount)) && asNumber(cardCount) >= 1 && asNumber(cardCount) <= 20;
  const invalidDuration = !Number.isFinite(asNumber(shootMinutes)) || asNumber(shootMinutes) <= 0;
  const invalidMargin = !Number.isFinite(asNumber(safetyMargin)) || asNumber(safetyMargin) < 0 || asNumber(safetyMargin) > 100;
  const invalidCapacity = !Number.isFinite(selectedCapacity) || selectedCapacity <= 0;
  const validInputs = Boolean(fact) && maxCardsValid && !invalidDuration && !invalidMargin && !invalidCapacity;
  const result = validInputs ? plan : null;
  const totalCapacity = selectedCapacity * asNumber(cardCount);
  const requiredCards = result?.requiredCardCount ?? 0;
  const timelineCards = result ? Math.max(requiredCards, asNumber(cardCount)) : 0;
  const bars = Array.from({ length: Math.min(timelineCards, 12) }, (_, index) => index);
  const effectiveProductHref = productHref ?? selectedModel.productHref;

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/support/tools" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-(--farabak-action-blue) focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2">
          <ArrowLeft aria-hidden="true" className="size-4 rotate-180" />بازگشت به ابزارهای پشتیبانی
        </Link>
        <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-(--farabak-ink-deep) hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2">
          <Printer aria-hidden="true" className="size-4" />چاپ برنامه ضبط
        </button>
      </div>

      <header className="max-w-4xl">
        <p className="text-sm font-semibold tracking-wide text-(--farabak-action-blue)">ابزار برنامه‌ریزی ضبط</p>
        <h1 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-(--farabak-ink-deep) sm:text-4xl lg:text-5xl">زمان ضبط و ظرفیت رسانه را پیش از روز فیلم‌برداری بسنجید</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-(--farabak-ink-muted)">تنظیمات ضبط را انتخاب کنید تا زمان تقریبی هر کارت و رسانه موردنیاز برای فیلم‌برداری برآورد شود. زمان واقعی با پیچیدگی صحنه، قالب‌بندی و ظرفیت قابل‌استفاده رسانه تغییر می‌کند.</p>
      </header>

      <section aria-label="تنظیمات ضبط و برآورد" className="grid gap-6 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] xl:items-start">
        <form className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-7" onSubmit={(event) => event.preventDefault()}>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-1 text-lg font-bold text-(--farabak-ink-deep)">تنظیمات دوربین</legend>
            <label className="text-sm font-semibold text-slate-800 sm:col-span-2" htmlFor="model">مدل دوربین
              <select id="model" className={controlClass} value={modelSlug} onChange={(event) => setModelSlug(event.target.value)}>
                {models.map((model) => <option key={model.slug} value={model.slug}>{model.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800" htmlFor="format">قالب تصویر
              <select id="format" className={controlClass} value={format} onChange={(event) => setFormat(event.target.value)}>
                {availableFormats.map((item) => <option key={item} value={item}>{item}</option>)}
                <option value="unsupported">سایر قالب‌ها</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800" htmlFor="frame-rate">نرخ فریم پروژه
              <select id="frame-rate" className={controlClass} value={frameRate} onChange={(event) => setFrameRate(event.target.value)}>
                {availableFrameRates.map((item) => <option key={item} value={item}>{item === "24" ? "۲۴" : item === "25" ? "۲۵" : "۳۰"} فریم بر ثانیه</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800" htmlFor="codec">کدک
              <select id="codec" className={controlClass} value="Blackmagic RAW" disabled><option>Blackmagic RAW</option></select>
            </label>
            <label className="text-sm font-semibold text-slate-800" htmlFor="quality">نوع فشرده‌سازی
              <select id="quality" className={controlClass} value={quality} onChange={(event) => { const next = event.target.value as BlackmagicQuality; setQuality(next); setCompression(next === "constant-bitrate" ? "8:1" : "Q3"); }}>
                <option value="constant-bitrate">نرخ بیت ثابت</option><option value="constant-quality">کیفیت ثابت؛ نرخ متغیر</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800" htmlFor="compression">فشرده‌سازی
              <select id="compression" className={controlClass} value={compression} onChange={(event) => setCompression(event.target.value)}>
                {availableCompressions.map((item) => <option key={item} value={item}>{item}</option>)}
                <option value="unsupported">ترکیب دیگر</option>
              </select>
            </label>
          </fieldset>

          <fieldset className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
            <legend className="mb-1 text-lg font-bold text-(--farabak-ink-deep)">رسانه و مدت فیلم‌برداری</legend>
            <label className="text-sm font-semibold text-slate-800" htmlFor="capacity">ظرفیت هر کارت / رسانه
              <select id="capacity" className={controlClass} value={capacity} onChange={(event) => setCapacity(event.target.value)}>
                {capacityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}<option value="custom">ظرفیت دلخواه</option>
              </select>
            </label>
            {capacity === "custom" ? <label className="text-sm font-semibold text-slate-800" htmlFor="custom-capacity">ظرفیت دلخواه به گیگابایت
              <input id="custom-capacity" className={controlClass} type="number" inputMode="decimal" min="1" step="any" value={customCapacity} onChange={(event) => setCustomCapacity(event.target.value)} aria-invalid={invalidCapacity} />
            </label> : null}
            <label className="text-sm font-semibold text-slate-800" htmlFor="cards">تعداد کارت‌ها
              <input id="cards" className={controlClass} type="number" inputMode="numeric" min="1" max="20" step="1" value={cardCount} onChange={(event) => setCardCount(event.target.value)} aria-invalid={!maxCardsValid} aria-describedby="cards-help" />
              <span id="cards-help" className="mt-1 block text-xs font-normal text-slate-600">عدد صحیح از ۱ تا ۲۰ وارد کنید.</span>
            </label>
            <label className="text-sm font-semibold text-slate-800" htmlFor="shoot-length">مدت ضبط خالص (دقیقه)
              <input id="shoot-length" className={controlClass} type="number" inputMode="decimal" min="0.1" step="any" value={shootMinutes} onChange={(event) => setShootMinutes(event.target.value)} aria-invalid={invalidDuration} aria-describedby="shoot-help" />
              <span id="shoot-help" className="mt-1 block text-xs font-normal text-slate-600">زمانی را وارد کنید که دوربین واقعاً ضبط می‌کند.</span>
            </label>
            <label className="text-sm font-semibold text-slate-800" htmlFor="safety">حاشیه اطمینان (درصد)
              <input id="safety" className={controlClass} type="number" inputMode="decimal" min="0" max="100" step="1" value={safetyMargin} onChange={(event) => setSafetyMargin(event.target.value)} aria-invalid={invalidMargin} aria-describedby="safety-help" />
              <span id="safety-help" className="mt-1 block text-xs font-normal text-slate-600">برای وقفه‌ها و تفاوت صحنه‌ها؛ از ۰ تا ۱۰۰ درصد.</span>
            </label>
          </fieldset>
        </form>

        <div className="space-y-5" aria-live="polite" aria-atomic="true">
          {!fact ? (
            <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-950" role="status"><h2 className="text-xl font-bold">برای این ترکیب دادهٔ تأییدشده نداریم</h2><p className="mt-3 leading-8">نرخ ضبط و زمان کارت نمایش داده نمی‌شود. نرخ‌های موجود فقط برای PYXIS 12K در قالب ۱۲K و ۲۴ فریم بر ثانیه است؛ برای مدل‌ها و حالت‌های دیگر عددی حدس نمی‌زنیم.</p></section>
          ) : !validInputs ? (
            <section className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-950" role="alert"><h2 className="text-xl font-bold">مقدارهای واردشده را بررسی کنید</h2><p className="mt-3 leading-8">ظرفیت و مدت باید بیشتر از صفر باشند، تعداد کارت عدد صحیح ۱ تا ۲۰ باشد و حاشیه اطمینان بین صفر تا ۱۰۰ قرار بگیرد.</p></section>
          ) : result ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-(--farabak-action-blue)">برنامه رسانه برای <bdi dir="ltr">{selectedModel.label}</bdi></p><h2 className="mt-2 text-2xl font-bold text-(--farabak-ink-deep)">نمای زمان ضبط</h2></div><span className={`rounded-full px-3 py-1.5 text-sm font-bold ${result.covered ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>{result.covered ? "ظرفیت انتخابی کافی است" : "رسانهٔ بیشتری لازم است"}</span></div>
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5"><div className="flex items-center justify-between gap-3 text-sm text-slate-700"><span>زمان فیلم‌برداری</span><span dir="ltr">{numberFormat.format(asNumber(shootMinutes))} min</span></div><div className="mt-4 flex gap-2 overflow-hidden" role="img" aria-label={`${numberFormat.format(asNumber(cardCount))} کارت با ظرفیت ${numberFormat.format(selectedCapacity)} گیگابایت، مجموع زمان ضبط ${numberFormat.format(result.totalRecordMinutes)} دقیقه`}>{bars.map((index) => <div key={index} className={`relative flex min-h-20 min-w-0 flex-1 items-center justify-center border-2 px-2 text-center ${index < asNumber(cardCount) ? "border-(--farabak-action-blue) bg-blue-50 text-(--farabak-ink-deep)" : "border-dashed border-amber-500 bg-amber-50 text-amber-950"}`}><div className="text-sm leading-6"><bdi dir="ltr" className="block font-bold">{numberFormat.format(selectedCapacity)} GB</bdi><span>{index < asNumber(cardCount) ? `کارت ${numberFormat.format(index + 1)}` : `نیاز ${numberFormat.format(index + 1)}`}</span></div></div>)}</div><div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-600"><span>ظرفیت انتخابی: {numberFormat.format(totalCapacity)} گیگابایت</span><span>با حاشیه: {numberFormat.format(result.requiredCapacityGb)} گیگابایت</span></div></div>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-(--farabak-paper) p-4"><dt className="text-sm text-slate-700">زمان تقریبی روی هر کارت</dt><dd className="mt-1 text-2xl font-bold text-(--farabak-ink-deep)" dir="ltr">{numberFormat.format(result.minutesPerCard)} <span className="text-sm font-medium">min</span></dd></div><div className="rounded-xl bg-(--farabak-paper) p-4"><dt className="text-sm text-slate-700">زمان کل رسانه‌های انتخابی</dt><dd className="mt-1 text-2xl font-bold text-(--farabak-ink-deep)" dir="ltr">{numberFormat.format(result.totalRecordMinutes)} <span className="text-sm font-medium">min</span></dd></div><div className="rounded-xl bg-(--farabak-paper) p-4"><dt className="text-sm text-slate-700">برآورد داده برای ضبط</dt><dd className="mt-1 text-2xl font-bold text-(--farabak-ink-deep)" dir="ltr">{preciseFormat.format(result.estimatedDataGb)} <span className="text-sm font-medium">GB</span></dd></div><div className="rounded-xl bg-(--farabak-paper) p-4"><dt className="text-sm text-slate-700">کارت لازم با حاشیه انتخابی</dt><dd className="mt-1 text-2xl font-bold text-(--farabak-ink-deep)" dir="ltr">{numberFormat.format(requiredCards)} <span className="text-sm font-medium">کارت</span></dd></div></dl>
              <p className="mt-5 text-sm leading-7 text-slate-700">نرخ مبنا: <bdi dir="ltr">{fact.minimumMbPerSecond === fact.maximumMbPerSecond ? `${numberFormat.format(fact.maximumMbPerSecond)} MB/s` : `${numberFormat.format(fact.minimumMbPerSecond)}–${numberFormat.format(fact.maximumMbPerSecond)} MB/s`}</bdi>. برای کیفیت ثابت، نرخ واقعی با پیچیدگی تصویر تغییر می‌کند؛ محاسبه از کران بالای اعلام‌شده برای برنامه‌ریزی محافظه‌کارانه استفاده می‌کند. این عدد حداقل سرعت پایدار کارت نیست.</p><p className="mt-2 text-sm leading-7 text-slate-700">برای انتخاب رسانه و بررسی سرعت ضبط، فهرست سازنده را ببینید؛ محاسبه ظرفیت، سازگاری کارت را تضمین نمی‌کند.</p>
              {effectiveProductHref ? <Link href={effectiveProductHref} className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-(--farabak-action-blue) underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue)">مشاهده صفحه محصول در فرابک <ArrowLeft aria-hidden="true" className="size-4 rotate-180" /></Link> : <Link href="/products/blackmagic" className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-(--farabak-action-blue) underline underline-offset-4">مشاهده دستهٔ محصولات Blackmagic</Link>}
            </section>
          ) : null}

          <section className="rounded-xl border border-slate-200 bg-(--farabak-paper) p-5 text-sm leading-7 text-slate-700"><h2 className="font-bold text-(--farabak-ink-deep)">منبع نرخ و محدودیت برآورد</h2><p className="mt-2">نرخ‌های ۱۲K سازنده بر مبنای ۲۴ فریم بر ثانیه است. نرخ بیت ثابت، اندازهٔ قابل‌پیش‌بینی‌تری دارد؛ حالت کیفیت ثابت متغیر است. زمان واقعی به صحنه، قالب فایل و فضای قابل‌استفاده رسانه بستگی دارد.</p><p className="mt-2">منبع: <a href={fact?.sourceUrl ?? "https://www.blackmagicdesign.com/products/blackmagicpyxis/techspecs"} target="_blank" rel="noreferrer" className="font-medium text-(--farabak-action-blue) underline underline-offset-4">مشخصات رسمی <bdi dir="ltr">Blackmagic PYXIS</bdi></a>؛ بررسی‌شده در ۳ نوامبر ۲۰۲۶.</p><p className="mt-2">سرعت نوشتن موردنیاز، تأیید سازگاری کارت و ضبط هم‌زمان پراکسی در این محاسبه وارد نشده‌اند.</p></section>
        </div>
      </section>

      <footer className="hidden border-t border-slate-300 pt-5 text-sm leading-7 text-slate-700 print:block"><p>برنامهٔ برآورد ضبط | فرابک</p><p>مدل: <bdi dir="ltr">{selectedModel.label}</bdi> · قالب: {format} · نرخ پروژه: {frameRate} fps · <bdi dir="ltr">Blackmagic RAW {compression}</bdi></p><p>رسانه: {capacity === "custom" ? customCapacity : capacity} گیگابایت × {cardCount} کارت · مدت: {shootMinutes} دقیقه · حاشیه: {safetyMargin}٪</p><p>منبع رسمی: https://www.blackmagicdesign.com/products/blackmagicpyxis/techspecs · بررسی ۳ نوامبر ۲۰۲۶</p><p>اعداد تخمینی‌اند. صحنه، فرمت رسانه و ظرفیت قابل‌استفاده زمان را تغییر می‌دهند. این محاسبه سازگاری یا حداقل سرعت پایدار رسانه را تأیید نمی‌کند.</p></footer>
    </div>
  );
}
