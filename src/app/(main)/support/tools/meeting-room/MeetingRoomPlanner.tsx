"use client";

import { ArrowLeft, Lightbulb, Projector, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  calculateMeetingRoom,
  validateRoom,
} from "@/features/support-tools/meeting-room/calculate";
import type {
  DisplayType,
  MeetingUse,
  RoomInput,
} from "@/features/support-tools/meeting-room/types";
import { downloadToolReportPdf } from "@/features/support-tools/pdf/download-tool-report";

const initial: RoomInput = {
  widthM: 5,
  lengthM: 8,
  nearestSeatM: 2,
  furthestSeatM: 7,
  seats: 12,
  use: "slides",
  daylightControlled: false,
  displayType: "projector",
  imageWidthM: 3,
  throwRatio: 1.5,
};
const asNumber = (value: string) => (value === "" ? Number.NaN : Number(value));

function NumberField({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 0.1,
  suffix = "متر",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label htmlFor={id} className="grid gap-2 text-sm font-semibold text-(--farabak-ink-deep)">
      {label}
      <span className="flex min-h-12 items-center rounded-md border border-slate-300 bg-white focus-within:border-(--farabak-action-blue) focus-within:ring-2 focus-within:ring-(--farabak-action-blue)/25">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={Number.isNaN(value) ? "" : value}
          onChange={(event) => onChange(asNumber(event.target.value))}
          className="h-11 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
        />
        <span className="shrink-0 px-3 text-slate-500">{suffix}</span>
      </span>
    </label>
  );
}

function RoomPreview({ room, screenWidth }: { room: RoomInput; screenWidth: number | undefined }) {
  const length = Number.isFinite(room.lengthM) ? room.lengthM : 8;
  const nearest = Number.isFinite(room.nearestSeatM) ? room.nearestSeatM : 2;
  const furthest = Number.isFinite(room.furthestSeatM) ? room.furthestSeatM : 7;
  const nearX = 16 + Math.min(55, Math.max(0, (nearest / Math.max(length, 1)) * 75));
  const farX = 16 + Math.min(68, Math.max(0, (furthest / Math.max(length, 1)) * 75));
  const screenScale = screenWidth ? Math.min(1, Math.max(0.2, screenWidth / 5)) : 0.5;
  const screenHalfHeight = 20 + screenScale * 17;
  const screenLabel =
    room.displayType === "projector"
      ? "پردهٔ نمایش"
      : room.displayType === "screen"
        ? "نمایشگر"
        : "نمایشگر / پرده";

  return (
    <figure className="overflow-hidden rounded-xl bg-[#071d35] text-white">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5 sm:px-7 sm:pt-7">
        <span className="font-bold">پیش‌نمایش متناسب با اتاق شما</span>
        <Badge className="border-white/20 bg-white/10 text-cyan-100 hover:bg-white/10">
          شماتیک تعاملی
        </Badge>
      </figcaption>
      <div className="px-3 pt-3 sm:px-6">
        <svg
          viewBox="0 0 760 300"
          role="img"
          aria-labelledby="room-preview-title room-preview-description"
          className="h-auto w-full"
        >
          <title id="room-preview-title">نمای شماتیک اتاق جلسه و تصویر</title>
          <desc id="room-preview-description">
            اتاق با طول {length} متر، فاصلهٔ نزدیک‌ترین صندلی {nearest} متر و دورترین صندلی{" "}
            {furthest} متر؛ {screenWidth ? `عرض تصویر ${screenWidth} متر` : "عرض تصویر نامشخص"}.
          </desc>
          <path d="M85 45 H680 V240 H85 Z" fill="#0d2b4a" stroke="#6c8299" strokeWidth="2" />
          <path d="M85 240 H680" stroke="#d8e1eb" strokeWidth="4" />
          <path
            d={`M110 ${150 - screenHalfHeight} V${150 + screenHalfHeight}`}
            stroke="#5de1ef"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d={`M116 ${150 - screenHalfHeight} L${nearX * 7.6} 226 L${nearX * 7.6} 165 Z`}
            fill="#46c6e3"
            fillOpacity=".08"
          />
          {screenWidth && (
            <path
              d={`M122 ${150 - screenHalfHeight} L${nearX * 7.6} 191 L${nearX * 7.6} 173 Z`}
              fill="#46c6e3"
              fillOpacity=".28"
            />
          )}
          <text
            x="110"
            y={150 - screenHalfHeight - 12}
            textAnchor="middle"
            fill="#c9f7ff"
            fontSize="13"
          >
            {screenLabel}
          </text>
          <line x1="120" y1="272" x2="680" y2="272" stroke="#8398ac" strokeDasharray="5 6" />
          <path d="M120 266v12 M680 266v12" stroke="#8398ac" />
          <text x="400" y="293" textAnchor="middle" fill="#d1dce7" fontSize="13">
            طول اتاق {length} متر
          </text>
          <g transform={`translate(${nearX * 7.6} 0)`}>
            <circle cy="226" r="8" fill="#f7c66d" />
            <path d="M-13 218 Q0 198 13 218" fill="none" stroke="#f7c66d" strokeWidth="4" />
            <text y="190" textAnchor="middle" fill="#ffe6b4" fontSize="12">
              نزدیک · {nearest}m
            </text>
          </g>
          <g transform={`translate(${farX * 7.6} 0)`}>
            <circle cy="226" r="8" fill="#c9d7e6" />
            <path d="M-13 218 Q0 198 13 218" fill="none" stroke="#c9d7e6" strokeWidth="4" />
            <text y="190" textAnchor="middle" fill="#e0e9f2" fontSize="12">
              دور · {furthest}m
            </text>
          </g>
          {room.displayType === "projector" && (
            <g transform="translate(605 82)">
              <rect x="-20" y="-10" width="40" height="20" rx="5" fill="#e4edf5" />
              <circle cx="20" r="6" fill="#5de1ef" />
              <text y="-20" textAnchor="middle" fill="#d9e7f5" fontSize="11">
                پروژکتور
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 text-center divide-x-reverse">
        <div className="p-3">
          <p className="text-xs text-slate-300">عرض اتاق</p>
          <p dir="ltr" className="mt-1 font-bold tabular-nums">
            {Number.isFinite(room.widthM) ? room.widthM : "—"} m
          </p>
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-300">عرض تصویر</p>
          <p dir="ltr" className="mt-1 font-bold tabular-nums">
            {screenWidth ? `${screenWidth} m` : "—"}
          </p>
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-300">تعداد صندلی</p>
          <p className="mt-1 font-bold tabular-nums">
            {Number.isFinite(room.seats) ? room.seats : "—"}
          </p>
        </div>
      </div>
    </figure>
  );
}

export default function MeetingRoomPlanner() {
  const [room, setRoom] = useState<RoomInput>(initial);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const patch = (values: Partial<RoomInput>) => setRoom((current) => ({ ...current, ...values }));
  const errors = useMemo(() => validateRoom(room), [room]);
  const result = useMemo(() => (errors.length ? null : calculateMeetingRoom(room)), [room, errors]);
  async function exportPdf() {
    if (!result || isExportingPdf) return;
    const number = (value: number) => value.toLocaleString("fa-IR", { maximumFractionDigits: 2 });
    const useLabel = { slides: "ارائه و جدول", video: "ویدئو", hybrid: "جلسهٔ ترکیبی با دوربین" }[
      room.use
    ];
    const displayLabel = {
      unknown: "هنوز مشخص نیست",
      screen: "نمایشگر مستقیم",
      projector: "ویدئوپروژکتور و پرده",
    }[room.displayType];
    setIsExportingPdf(true);
    setPdfError("");
    try {
      await downloadToolReportPdf({
        title: "گزارش برنامه‌ریزی نمایشگر اتاق جلسه",
        subtitle: "بازهٔ آغازین اندازهٔ تصویر بر پایهٔ چیدمان و فاصلهٔ دید واردشده",
        fileName: "farabak-meeting-room-plan.pdf",
        metrics: [
          {
            label: "بازهٔ قطر پیشنهادی",
            value: `${result.minDiagonalIn}–${result.maxDiagonalIn} اینچ`,
          },
          ...(result.throwDistanceM
            ? [
                {
                  label: "فاصلهٔ لنز تا پرده",
                  value: `${number(result.throwDistanceM.min)}–${number(result.throwDistanceM.max)} m`,
                },
              ]
            : []),
        ],
        pages: [
          [
            {
              title: "ابعاد و چیدمان اتاق",
              rows: [
                {
                  label: "ابعاد اتاق",
                  value: `${number(room.widthM)} × ${number(room.lengthM)} متر`,
                },
                { label: "نزدیک‌ترین صندلی", value: `${number(room.nearestSeatM)} متر` },
                { label: "دورترین صندلی", value: `${number(room.furthestSeatM)} متر` },
                { label: "تعداد صندلی", value: `${number(room.seats)} نفر` },
                { label: "کاربری غالب", value: useLabel },
                { label: "نوع نمایشگر", value: displayLabel },
                { label: "کنترل نور روز", value: room.daylightControlled ? "بله" : "خیر" },
              ],
            },
            {
              title: "مشخصات تصویر و نصب",
              rows: [
                {
                  label: "عرض تصویر واردشده",
                  value: room.imageWidthM == null ? "ثبت نشده" : `${number(room.imageWidthM)} متر`,
                },
                {
                  label: "نسبت پرتاب لنز",
                  value: room.throwRatio == null ? "ثبت نشده" : `${number(room.throwRatio)}:۱`,
                },
                { label: "روش برآورد", value: result.method },
              ],
              paragraphs: result.assumptions,
            },
          ],
          [
            {
              title: "موارد نیازمند بررسی",
              paragraphs: result.reasons.length
                ? result.reasons
                : ["موردی خارج از محدودهٔ مثال‌های مرجع گزارش نشده است."],
            },
            {
              title: "یادداشت محاسبه",
              paragraphs: [
                "فاصلهٔ پرتاب با عرض تصویر × نسبت پرتاب محاسبه شده است؛ بازهٔ درج‌شده حدود ±۵٪ را پوشش می‌دهد.",
              ],
            },
          ],
        ],
        disclaimer:
          "این بازه برای شروع بررسی است و جایگزین محاسبهٔ مهندسی، بررسی اندازهٔ متن و وضوح، زاویهٔ دید، نور محیط یا تأیید فاصلهٔ نصب در محل نیست.",
      });
    } catch {
      setPdfError("ساخت فایل PDF انجام نشد. دوباره تلاش کنید.");
    } finally {
      setIsExportingPdf(false);
    }
  }
  const selectClass =
    "min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-(--farabak-ink-deep) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue)";

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-(--farabak-ink-deep)">
      <div className="mx-auto w-full max-w-[1580px] px-5 py-8 min-[992px]:px-16 min-[1200px]:px-24 sm:px-8 md:px-12 2xl:px-40 print:max-w-none print:px-0">
        <header className="mb-8 max-w-4xl">
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-(--farabak-action-blue)"
          >
            برنامه‌ریزی اتاق جلسه
          </Badge>
          <h1 className="mt-3 text-3xl leading-tight font-black tracking-tight sm:text-5xl">
            ابعاد اتاق را به اندازهٔ اولیهٔ تصویر تبدیل کنید
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
            مقادیر را تغییر دهید و پیش‌نمایش را هم‌زمان ببینید. نتیجه برای گفت‌وگوی اولیه است؛
            خوانایی نهایی به محتوا، وضوح، زاویهٔ دید و نور بستگی دارد.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card className="order-2 shadow-sm lg:order-1 print:hidden">
            <CardHeader className="border-b border-slate-100">
              <h2 className="text-xl font-bold">مشخصات اتاق</h2>
              <p className="text-sm leading-6 text-slate-500">
                هر تغییری در ورودی‌ها بلافاصله در تصویر و برآورد دیده می‌شود.
              </p>
            </CardHeader>
            <CardContent className="grid gap-6 pt-6">
              <fieldset className="grid gap-4">
                <legend className="mb-3 text-sm font-bold text-slate-700">
                  ابعاد و فاصلهٔ دید
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    id="room-width"
                    label="عرض اتاق"
                    value={room.widthM}
                    onChange={(widthM) => patch({ widthM })}
                    min={2}
                    max={20}
                  />
                  <NumberField
                    id="room-length"
                    label="طول اتاق"
                    value={room.lengthM}
                    onChange={(lengthM) => patch({ lengthM })}
                    min={2}
                    max={30}
                  />
                  <NumberField
                    id="nearest-seat"
                    label="نزدیک‌ترین صندلی"
                    value={room.nearestSeatM}
                    onChange={(nearestSeatM) => patch({ nearestSeatM })}
                    min={0.5}
                  />
                  <NumberField
                    id="furthest-seat"
                    label="دورترین صندلی"
                    value={room.furthestSeatM}
                    onChange={(furthestSeatM) => patch({ furthestSeatM })}
                    min={0.5}
                    max={30}
                  />
                  <NumberField
                    id="seat-count"
                    label="تعداد صندلی‌ها"
                    value={room.seats}
                    onChange={(seats) => patch({ seats })}
                    min={1}
                    max={500}
                    step={1}
                    suffix="نفر"
                  />
                </div>
                {errors.length > 0 && (
                  <ul role="alert" className="grid gap-1 text-sm font-medium text-red-800">
                    {errors.map((error) => (
                      <li key={error}>بررسی کنید: {error}</li>
                    ))}
                  </ul>
                )}
              </fieldset>
              <fieldset className="grid gap-4 border-t border-slate-200 pt-5">
                <legend className="mb-1 text-sm font-bold text-slate-700">کاربری و نمایشگر</legend>
                <label className="grid gap-2 text-sm font-semibold">
                  کاربری غالب
                  <select
                    className={selectClass}
                    value={room.use}
                    onChange={(event) => patch({ use: event.target.value as MeetingUse })}
                  >
                    <option value="slides">ارائه و جدول</option>
                    <option value="video">ویدئو</option>
                    <option value="hybrid">جلسهٔ ترکیبی با دوربین</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  نوع نمایشگر
                  <select
                    className={selectClass}
                    value={room.displayType}
                    onChange={(event) => patch({ displayType: event.target.value as DisplayType })}
                  >
                    <option value="unknown">هنوز مشخص نیست</option>
                    <option value="screen">نمایشگر مستقیم</option>
                    <option value="projector">ویدئوپروژکتور و پرده</option>
                  </select>
                </label>
                <label className="flex min-h-12 items-center gap-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    className="size-5 accent-(--farabak-action-blue)"
                    checked={room.daylightControlled}
                    onChange={(event) => patch({ daylightControlled: event.target.checked })}
                  />
                  امکان کنترل نور روز وجود دارد
                </label>
              </fieldset>
              {room.displayType === "projector" && (
                <fieldset className="grid gap-4 border-t border-slate-200 pt-5">
                  <legend className="mb-1 text-sm font-bold text-slate-700">
                    پرده و محل نصب پروژکتور
                  </legend>
                  <p className="text-sm leading-6 text-slate-500">
                    با تغییر عرض تصویر یا نسبت پرتاب، پرتو و فاصلهٔ نصب در پیش‌نمایش و نتیجه به‌روز
                    می‌شوند.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField
                      id="image-width"
                      label="عرض تصویر"
                      value={room.imageWidthM ?? Number.NaN}
                      onChange={(imageWidthM) =>
                        patch({ imageWidthM: Number.isNaN(imageWidthM) ? undefined : imageWidthM })
                      }
                      min={0.5}
                      max={10}
                    />
                    <NumberField
                      id="throw-ratio"
                      label="نسبت پرتاب لنز"
                      value={room.throwRatio ?? Number.NaN}
                      onChange={(throwRatio) =>
                        patch({ throwRatio: Number.isNaN(throwRatio) ? undefined : throwRatio })
                      }
                      min={0.1}
                      max={10}
                      step={0.01}
                      suffix=":۱"
                    />
                  </div>
                </fieldset>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={exportPdf}
                disabled={!result || isExportingPdf}
                className="justify-self-start"
              >
                {isExportingPdf ? "در حال ساخت PDF…" : "دانلود گزارش PDF"}
              </Button>
              {pdfError ? (
                <p role="alert" className="text-sm text-red-700">
                  {pdfError}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <section
            aria-labelledby="result-heading"
            aria-live="polite"
            className="order-1 grid gap-5 lg:order-2"
          >
            <RoomPreview room={room} screenWidth={room.imageWidthM} />
            {result ? (
              <>
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit bg-blue-50 text-(--farabak-action-blue) hover:bg-blue-50">
                      بازهٔ آغازین برای بررسی
                    </Badge>
                    <h2 id="result-heading" className="mt-2 text-3xl font-black sm:text-4xl">
                      <bdi dir="ltr">
                        {result.minDiagonalIn}–{result.maxDiagonalIn}
                      </bdi>{" "}
                      اینچ
                    </h2>
                    <p className="text-sm leading-6 text-slate-600">
                      قطر تقریبی تصویر عریض ۱۶:۹؛ اندازهٔ نهایی را در محل بررسی کنید.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm leading-6">
                      <Lightbulb
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 text-amber-600"
                      />
                      <div>
                        <p className="font-bold">بر پایهٔ فاصلهٔ دید</p>
                        <p className="mt-1 text-slate-600">{result.method}</p>
                        {result.assumptions.map((item) => (
                          <p key={item} className="mt-1 text-slate-600">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                    {result.reasons.length > 0 && (
                      <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
                        <p className="font-bold">نیازمند بررسی کارشناسی</p>
                        <ul className="mt-2 grid gap-1 text-sm leading-6">
                          {result.reasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.throwDistanceM && (
                      <div className="mt-4 flex items-center gap-3 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
                        <Projector aria-hidden="true" className="size-5 shrink-0 text-cyan-800" />
                        <p className="text-sm font-semibold">
                          فاصلهٔ لنز تا پرده:{" "}
                          <bdi dir="ltr">
                            {result.throwDistanceM.min.toFixed(1)}–
                            {result.throwDistanceM.max.toFixed(1)} m
                          </bdi>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Users aria-hidden="true" className="size-5 text-(--farabak-action-blue)" />
                      <h2 className="text-lg font-bold">پیش از انتخاب، این موارد را بررسی کنید</h2>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-2 text-sm leading-7 text-slate-700">
                    <p>فاصله و زاویهٔ دید صندلی‌های کناری</p>
                    <p>اندازهٔ متن، وضوح منبع تصویر و نوع ارائه</p>
                    <p>نور پنجره‌ها، بازتاب و روشنایی محیط</p>
                    <p>محل دوربین، میکروفن و اتصالات در جلسهٔ ترکیبی</p>
                    <p>سازگاری پایه، تهویه و دسترسی برای سرویس</p>
                    <Button asChild className="mt-2 w-fit">
                      <Link href="/contact-us">
                        درخواست مشاوره <ArrowLeft aria-hidden="true" className="size-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <p className="text-xs leading-6 text-slate-500">
                  این برآورد جایگزین محاسبهٔ مهندسی یا بررسی محل نصب نیست.
                </p>
              </>
            ) : (
              <Card role="status">
                <CardContent className="py-5">
                  <h2 id="result-heading" className="font-bold">
                    برای دیدن بازه، ابعاد را اصلاح کنید.
                  </h2>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
        <footer className="mt-10 border-t border-slate-200 pt-5 text-sm print:hidden">
          <Link href="/support/tools" className="font-bold underline underline-offset-4">
            بازگشت به ابزارهای پشتیبانی
          </Link>
        </footer>
      </div>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          header,
          nav,
          footer,
          button {
            display: none !important;
          }
          main {
            background: white !important;
          }
          article,
          figure {
            break-inside: avoid;
            box-shadow: none !important;
          }
          figure {
            background: #061a30 !important;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </main>
  );
}
