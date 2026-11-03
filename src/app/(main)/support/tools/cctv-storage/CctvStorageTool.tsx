"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { calculateCctvStorage, validateCctvStorageInputs } from "@/features/support-tools/cctv-storage/calculation";
import type { CameraGroupFieldErrors, CameraGroupInput } from "@/features/support-tools/cctv-storage/types";

const fieldClass = "mt-2 min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-(--farabak-ink-deep) shadow-sm focus-visible:border-(--farabak-action-blue) focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none";
const initialGroup = (id: string): CameraGroupInput => ({
  id, label: "گروه دوربین ۱", cameraCount: null, averageBitrateMbps: null,
  bitrateSource: "unknown", recordingHoursPerDay: 24, retentionDays: 30,
  recordingMode: "continuous", motionDutyCycle: null,
});
const numberFormat = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });
const formatNumber = (value: number) => Number.isFinite(value) ? numberFormat.format(value) : "—";

export default function CctvStorageTool() {
  const [groups, setGroups] = useState<CameraGroupInput[]>([initialGroup("camera-group-1")]);
  const [headroomPercent, setHeadroomPercent] = useState(20);
  const validation = useMemo(() => validateCctvStorageInputs(groups, headroomPercent), [groups, headroomPercent]);
  const hasErrors = Object.keys(validation.groupErrors).length > 0 || Boolean(validation.headroomError);
  const result = useMemo(() => {
    if (hasErrors || groups.length === 0) return null;
    try { return calculateCctvStorage(groups, headroomPercent); } catch { return null; }
  }, [groups, headroomPercent, hasErrors]);

  function updateGroup(id: string, patch: Partial<CameraGroupInput>) {
    setGroups((current) => current.map((group) => group.id === id ? { ...group, ...patch } : group));
  }
  function addGroup() {
    const id = `camera-group-${Date.now()}`;
    setGroups((current) => [...current, { ...initialGroup(id), label: `گروه دوربین ${numberFormat.format(current.length + 1)}` }]);
  }
  function removeGroup(id: string) { setGroups((current) => current.filter((group) => group.id !== id)); }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-14">
      <section aria-labelledby="camera-groups-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-300 pb-4">
          <div><p className="text-xs font-semibold tracking-wide text-(--farabak-action-blue)">ورودی سامانه</p><h2 id="camera-groups-heading" className="mt-2 text-2xl font-bold text-(--farabak-ink-deep)">گروه‌های دوربین</h2></div>
          <button type="button" onClick={addGroup} className="min-h-12 rounded-md bg-(--farabak-ink-deep) px-4 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:outline-none">افزودن گروه</button>
        </div>
        {groups.length === 0 ? <p className="mt-6 border-r-2 border-(--farabak-action-blue) bg-slate-50 p-4 leading-7 text-slate-700">گروهی برای برآورد وجود ندارد. برای شروع، یک گروه دوربین اضافه کنید.</p> : null}
        <div className="divide-y divide-slate-200">
          {groups.map((group, index) => {
            const errors = validation.groupErrors[group.id] ?? {};
            const fieldId = (field: keyof CameraGroupFieldErrors) => `${group.id}-${field}`;
            const numericField = (label: string, field: "cameraCount" | "averageBitrateMbps" | "recordingHoursPerDay" | "retentionDays", value: number | null, unit: string, placeholder: string) => (
              <div>
                <label htmlFor={fieldId(field)} className="block text-sm font-semibold text-slate-800">{label}</label>
                <div className="relative"><input id={fieldId(field)} type="number" min="0" step="any" inputMode="decimal" placeholder={placeholder} value={value ?? ""} onChange={(event) => updateGroup(group.id, { [field]: event.target.value === "" ? null : Number(event.target.value) })} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `${fieldId(field)}-error` : undefined} className={`${fieldClass} pl-16`} /><span className="pointer-events-none absolute top-0 left-3 flex h-12 items-center text-sm text-slate-500">{unit}</span></div>
                {errors[field] ? <p id={`${fieldId(field)}-error`} className="mt-1 text-sm leading-6 text-red-700">{errors[field]}</p> : null}
              </div>
            );
            return (
              <fieldset key={group.id} className="min-w-0 py-6 first:pt-5">
                <legend className="sr-only">تنظیمات گروه دوربین {numberFormat.format(index + 1)}</legend>
                <div className="mb-5 flex items-center justify-between gap-4"><label htmlFor={`${group.id}-label`} className="sr-only">نام گروه</label><input id={`${group.id}-label`} value={group.label} onChange={(event) => updateGroup(group.id, { label: event.target.value })} className="min-h-10 max-w-56 border-0 border-b border-slate-300 bg-transparent px-1 font-bold text-(--farabak-ink-deep) focus-visible:border-(--farabak-action-blue) focus-visible:outline-none" />{groups.length > 1 ? <button type="button" onClick={() => removeGroup(group.id)} className="min-h-11 rounded-md px-3 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none">حذف گروه</button> : null}</div>
                <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  {numericField("تعداد دوربین", "cameraCount", group.cameraCount, "دوربین", "مثلاً ۴")}
                  <div><label htmlFor={fieldId("averageBitrateMbps")} className="block text-sm font-semibold text-slate-800">نرخ بیت میانگین هر دوربین</label><div className="relative"><input id={fieldId("averageBitrateMbps")} type="number" min="0" step="any" inputMode="decimal" placeholder="مثلاً ۸" value={group.averageBitrateMbps ?? ""} onChange={(event) => updateGroup(group.id, { averageBitrateMbps: event.target.value === "" ? null : Number(event.target.value), bitrateSource: "entered", bitrateLabel: "نرخ واردشده" })} aria-invalid={Boolean(errors.averageBitrateMbps)} aria-describedby={errors.averageBitrateMbps ? `${fieldId("averageBitrateMbps")}-error` : `${fieldId("averageBitrateMbps")}-help`} className={`${fieldClass} pl-16`} /><span className="pointer-events-none absolute top-0 left-3 flex h-12 items-center text-sm text-slate-500">Mbps</span></div>{errors.averageBitrateMbps ? <p id={`${fieldId("averageBitrateMbps")}-error`} className="mt-1 text-sm leading-6 text-red-700">{errors.averageBitrateMbps}</p> : <p id={`${fieldId("averageBitrateMbps")}-help`} className="mt-1 text-xs leading-5 text-slate-500">اگر مقدار را نمی‌دانید، یک برآورد تقریبی انتخاب کنید.</p>}
                    <label htmlFor={`${group.id}-preset`} className="mt-3 block text-xs font-semibold text-slate-700">منبع نرخ بیت</label><select id={`${group.id}-preset`} value={group.bitrateSource} onChange={(event) => { const source = event.target.value as CameraGroupInput["bitrateSource"]; updateGroup(group.id, source === "rough-preset" ? { bitrateSource: source, averageBitrateMbps: 8, bitrateLabel: "برآورد تقریبی انتخابی: ۸ Mbps" } : source === "unknown" ? { bitrateSource: source, averageBitrateMbps: null, bitrateLabel: undefined } : { bitrateSource: source, averageBitrateMbps: null, bitrateLabel: "نرخ واردشده" }); }} className={fieldClass}><option value="unknown">هنوز مشخص نیست</option><option value="entered">نرخ واردشده</option><option value="rough-preset">برآورد تقریبی ۸ Mbps</option></select></div>
                  {numericField("ساعت ضبط در روز", "recordingHoursPerDay", group.recordingHoursPerDay, "ساعت", "۲۴")}
                  {numericField("مدت نگهداری", "retentionDays", group.retentionDays, "روز", "۳۰")}
                  <div className="sm:col-span-2"><span className="block text-sm font-semibold text-slate-800">شیوه ضبط</span><div className="mt-2 flex flex-wrap gap-x-6 gap-y-2"><label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="radio" name={`${group.id}-mode`} checked={group.recordingMode === "continuous"} onChange={() => updateGroup(group.id, { recordingMode: "continuous" })} className="size-4 accent-(--farabak-action-blue)" />پیوسته</label><label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="radio" name={`${group.id}-mode`} checked={group.recordingMode === "motion"} onChange={() => updateGroup(group.id, { recordingMode: "motion" })} className="size-4 accent-(--farabak-action-blue)" />بر پایه تشخیص حرکت</label></div>{group.recordingMode === "motion" ? <div className="mt-3 max-w-sm"><label htmlFor={fieldId("motionDutyCycle")} className="block text-sm font-semibold text-slate-800">سهم زمان ضبط در روز</label><div className="relative"><input id={fieldId("motionDutyCycle")} type="number" min="1" max="100" step="1" inputMode="numeric" placeholder="مثلاً ۵۰" value={group.motionDutyCycle == null ? "" : group.motionDutyCycle * 100} onChange={(event) => updateGroup(group.id, { motionDutyCycle: event.target.value === "" ? null : Number(event.target.value) / 100 })} aria-invalid={Boolean(errors.motionDutyCycle)} aria-describedby={errors.motionDutyCycle ? `${fieldId("motionDutyCycle")}-error` : `${fieldId("motionDutyCycle")}-help`} className={`${fieldClass} pl-12`} /><span className="pointer-events-none absolute top-0 left-3 flex h-12 items-center text-sm text-slate-500">٪</span></div>{errors.motionDutyCycle ? <p id={`${fieldId("motionDutyCycle")}-error`} className="mt-1 text-sm text-red-700">{errors.motionDutyCycle}</p> : <p id={`${fieldId("motionDutyCycle")}-help`} className="mt-1 text-xs leading-5 text-slate-500">این سهم، یک فرض روشن برای مدت ضبط است.</p>}</div> : null}</div>}
                </div>
              </fieldset>
            );
          })}
        </div>
        <div className="mt-4 max-w-xs"><label htmlFor="headroom" className="block text-sm font-semibold text-slate-800">فضای رزرو برای برنامه‌ریزی</label><div className="relative"><input id="headroom" type="number" min="0" max="100" step="1" value={headroomPercent} onChange={(event) => setHeadroomPercent(Number(event.target.value))} aria-invalid={Boolean(validation.headroomError)} aria-describedby={validation.headroomError ? "headroom-error" : "headroom-help"} className={`${fieldClass} pl-12`} /><span className="pointer-events-none absolute top-0 left-3 flex h-12 items-center text-sm text-slate-500">٪</span></div>{validation.headroomError ? <p id="headroom-error" className="mt-1 text-sm text-red-700">{validation.headroomError}</p> : <p id="headroom-help" className="mt-1 text-xs leading-5 text-slate-500">پیش‌فرض ۲۰٪؛ فقط ظرفیت پیشنهادی را تغییر می‌دهد.</p>}</div>
      </section>

      <section aria-labelledby="capacity-heading" className="min-w-0 lg:sticky lg:top-8 lg:self-start print:static">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-(--farabak-ink-deep) pb-4"><div><p className="text-xs font-semibold tracking-wide text-(--farabak-action-blue)">خروجی برآورد</p><h2 id="capacity-heading" className="mt-2 text-2xl font-bold text-(--farabak-ink-deep)">دفتر ظرفیت</h2></div><p className="text-xs text-slate-500">واحد ذخیره‌سازی: GB ده‌دهی</p></div>
        <div aria-live="polite" aria-atomic="true" className="mt-6">
          {groups.length === 0 ? <p className="border-r-2 border-(--farabak-action-blue) bg-slate-50 p-4 leading-7 text-slate-700">برای دیدن نتیجه، یک گروه دوربین اضافه کنید.</p> : hasErrors ? <p className="border-r-2 border-amber-500 bg-amber-50 p-4 leading-7 text-amber-950">مقادیر نامشخص یا نامعتبر را در ورودی‌ها اصلاح کنید تا برآورد نمایش داده شود.</p> : result ? <>
            <div className="border-b border-slate-200 pb-5"><p className="text-sm text-slate-600">فضای خام موردنیاز</p><p dir="ltr" className="mt-1 break-all text-4xl font-bold tracking-tight text-(--farabak-ink-deep) tabular-nums sm:text-5xl">{formatNumber(result.totalStorageGb)} <span className="text-xl font-semibold">GB</span></p><div className="mt-5 h-3 w-full overflow-hidden rounded-sm bg-slate-200" role="img" aria-label={`ظرفیت خام ${formatNumber(result.totalStorageGb)} گیگابایت و ظرفیت برنامه‌ریزی‌شده ${formatNumber(result.plannedStorageGb)} گیگابایت`}><div className="h-full bg-(--farabak-action-blue)" style={{ width: `${Math.max(4, 100 / (1 + headroomPercent / 100))}%` }} /></div><div className="mt-2 flex justify-between gap-2 text-xs text-slate-600"><span>خام</span><span>با {formatNumber(headroomPercent)}٪ فضای رزرو: <bdi dir="ltr" className="font-semibold tabular-nums">{formatNumber(result.plannedStorageGb)} GB</bdi></span></div></div>
            <dl className="grid grid-cols-2 border-b border-slate-200 py-4"><div className="border-l border-slate-200 pl-3"><dt className="text-xs text-slate-600">داده در روز</dt><dd dir="ltr" className="mt-1 break-all text-xl font-bold text-(--farabak-ink-deep) tabular-nums">{formatNumber(result.dailyGb)} <span className="text-sm font-medium">GB</span></dd></div><div className="pr-3"><dt className="text-xs text-slate-600">پهنای باند مجموع</dt><dd dir="ltr" className="mt-1 break-all text-xl font-bold text-(--farabak-ink-deep) tabular-nums">{formatNumber(result.bandwidthMbps)} <span className="text-sm font-medium">Mbps</span></dd></div></dl>
            <h3 className="mt-5 text-sm font-bold text-slate-800">سهم هر گروه</h3><ul className="mt-2 divide-y divide-slate-200 border-y border-slate-200">{result.groups.map((group) => <li key={group.id} className="flex min-w-0 items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{group.label}</p><p className="mt-1 text-xs text-slate-500">{group.bitrateLabel}</p></div><p dir="ltr" className="shrink-0 text-right text-sm font-bold text-(--farabak-ink-deep) tabular-nums">{formatNumber(group.storageGb)} GB</p></li>)}</ul>
            <h3 className="mt-5 text-sm font-bold text-slate-800">فرض‌های محاسبه</h3><ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-6 text-slate-600">{result.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
          </> : null}
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-300 pt-5 sm:flex-row lg:flex-col xl:flex-row print:hidden"><button type="button" onClick={() => window.print()} className="min-h-12 rounded-md border border-(--farabak-ink-deep) px-4 text-sm font-semibold text-(--farabak-ink-deep) hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none">چاپ برآورد</button><Link href="/contact-us" className="inline-flex min-h-12 items-center justify-center rounded-md bg-(--farabak-action-blue) px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:outline-none">مشاوره برای طراحی سامانه</Link></div>
      </section>
      <style jsx global>{`@media print { @page { margin: 16mm; } body { color: #061a30; background: white !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; } header, nav, footer, [aria-label="مسیر راهنما"] { display: none !important; } main { padding: 0 !important; } section { break-inside: avoid; } input, select { border: 1px solid #94a3b8 !important; box-shadow: none !important; } button, a[href="/contact-us"] { display: none !important; } }`}</style>
    </div>
  );
}
