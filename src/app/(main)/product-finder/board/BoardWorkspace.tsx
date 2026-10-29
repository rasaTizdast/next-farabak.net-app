"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Candidate = {
  product: { productId: number; name: string; model: string | null };
  matched: string[];
  tradeoffs: string[];
  unknown: string[];
};

type SavedReport = { category: { name: string }; candidates: Candidate[] };

const rows = [
  { key: "matched", label: "تطبیق‌های ثبت‌شده" },
  { key: "tradeoffs", label: "ملاحظات" },
  { key: "unknown", label: "نیازمند بررسی" },
] as const;

export default function BoardWorkspace() {
  const [report, setReport] = useState<SavedReport | null>(null);
  const [differencesOnly, setDifferencesOnly] = useState(true);

  useEffect(() => {
    try {
      const value = localStorage.getItem("farabak-product-advisor:report:v1");
      if (value) setReport(JSON.parse(value));
    } catch {
      setReport(null);
    }
  }, []);

  const visibleRows = useMemo(() => {
    if (!report) return [];
    return rows.filter((row) => {
      if (!differencesOnly) return true;
      return (
        new Set(report.candidates.map((candidate) => candidate[row.key].join("، ") || "ثبت نشده"))
          .size > 1
      );
    });
  }, [differencesOnly, report]);

  if (!report) {
    return (
      <section className="rounded-3xl bg-white p-8">
        <h1 className="text-2xl font-black">میز تصمیم خالی است</h1>
        <Link className="mt-5 inline-flex font-bold text-blue-700" href="/product-finder">
          شروع راهنمای انتخاب
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm sm:p-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">میز تصمیم</p>
          <h1 className="text-3xl font-black">مقایسه {report.category.name}</h1>
        </div>
        <button
          type="button"
          className="rounded-xl border border-slate-300 px-4 py-2 font-bold"
          onClick={() => setDifferencesOnly((current) => !current)}
        >
          {differencesOnly ? "نمایش همه اطلاعات" : "فقط تفاوت‌ها"}
        </button>
      </div>
      <div className="mt-8 overflow-x-auto" tabIndex={0} aria-label="جدول مقایسه محصولات">
        <table className="w-full min-w-[640px] border-collapse text-right">
          <thead>
            <tr>
              <th className="border-b p-3">معیار</th>
              {report.candidates.map((candidate) => (
                <th className="border-b p-3" key={candidate.product.productId}>
                  {candidate.product.name}
                  {candidate.product.model ? <bdi dir="ltr"> {candidate.product.model}</bdi> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.key}>
                <th className="border-b p-3 text-sm">{row.label}</th>
                {report.candidates.map((candidate) => (
                  <td
                    className="border-b p-3 text-sm text-slate-700"
                    key={candidate.product.productId}
                  >
                    {candidate[row.key].join("، ") || "ثبت نشده"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link
        href="/product-finder/report"
        className="mt-7 inline-flex rounded-xl bg-blue-700 px-4 py-2 font-bold text-white"
      >
        دریافت گزارش انتخاب
      </Link>
    </section>
  );
}
