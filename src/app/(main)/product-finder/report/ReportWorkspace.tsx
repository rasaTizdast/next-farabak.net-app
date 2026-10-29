"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { shouldShowAdvisorModel } from "@/features/product-advisor/display";

type Report = {
  category: { name: string };
  answers: { questionId: string; value: string }[];
  candidates: {
    product: { productId: number; name: string; model: string | null; detailHref: string };
    matched: string[];
    tradeoffs: string[];
    unknown: string[];
  }[];
  createdAt: string;
};

export default function ReportWorkspace() {
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => {
    try {
      const value = localStorage.getItem("farabak-product-advisor:report:v1");
      if (value) setReport(JSON.parse(value));
    } catch {
      setReport(null);
    }
  }, []);
  if (!report)
    return (
      <section className="rounded-3xl bg-white p-8">
        <h1 className="text-2xl font-black">گزارشی برای چاپ ندارید</h1>
        <Link className="mt-5 inline-flex font-bold text-blue-700" href="/product-finder">
          شروع راهنمای انتخاب
        </Link>
      </section>
    );
  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm sm:p-12">
      <div className="no-print flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white"
        >
          ذخیره به‌صورت PDF
        </button>
      </div>
      <h1 className="mt-5 text-3xl font-black text-slate-950">گزارش انتخاب فرابک</h1>
      <p className="mt-2 text-slate-600">دسته انتخاب‌شده: {report.category.name}</p>
      <p className="text-sm text-slate-500">
        این گزارش پیشنهاد اولیه است و جایگزین استعلام یا پیش‌فاکتور نیست.
      </p>
      <h2 className="mt-8 text-xl font-bold">محصولات پیشنهادی</h2>
      <div className="mt-4 space-y-4">
        {report.candidates.map((candidate) => (
          <article
            key={candidate.product.productId}
            className="break-inside-avoid rounded-2xl border p-5"
          >
            <h3 className="font-bold">
              {candidate.product.name}{" "}
              {shouldShowAdvisorModel(candidate.product.name, candidate.product.model) ? (
                <bdi dir="ltr">{candidate.product.model}</bdi>
              ) : null}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {candidate.matched.join("، ") || "تطبیق قطعی ثبت نشده"}
            </p>
            {candidate.tradeoffs.length ? (
              <p className="mt-2 text-sm text-amber-800">{candidate.tradeoffs.join("، ")}</p>
            ) : null}
            {candidate.unknown.length ? (
              <p className="mt-2 text-sm text-slate-500">
                نیازمند بررسی: {candidate.unknown.join("، ")}
              </p>
            ) : null}
            <Link
              href={candidate.product.detailHref}
              className="no-print mt-3 inline-flex text-sm font-bold text-blue-700"
            >
              مشاهده محصول
            </Link>
          </article>
        ))}
      </div>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </section>
  );
}
