"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";
import { useApiFetch } from "@/hooks/useApiFetch";

type ApiResponse = {
  data: ProductRow[];
};

type ProductRow = {
  ProductId: number;
  Type: string;
  Price: number;
  Discount: number;
  Partner_Price?: string | null;
  link: string;
};

function calcOriginal(p: ProductRow) {
  const price = p.Price || 0;
  const discount = p.Discount || 0;
  return Math.max(price - discount, 0);
}

async function doFetchUsdRate(
  fetchUsdToRialRate: () => Promise<number | null>,
  setUsdRate: (rate: number) => void
) {
  try {
    const rate = await fetchUsdToRialRate();
    if (rate && rate > 0) setUsdRate(rate);
  } catch {}
}

export default function BranchPartnerPricesPage() {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<"Type" | "Original" | "Partner">("Type");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const {
    data: apiData,
    loading,
    error,
    refetch,
  } = useApiFetch<ApiResponse>("/api/admin/products?limit=500");

  interface RawProduct {
    ProductId: number;
    Type: string;
    Price: number | string | null;
    Discount: number | string | null;
    Partner_Price?: string | null;
    link: string;
  }

  const data: ProductRow[] = (apiData?.data || []).map((p: RawProduct) => ({
    ProductId: p.ProductId,
    Type: p.Type,
    Price: Number(p.Price ?? 0),
    Discount: Number(p.Discount ?? 0),
    Partner_Price: p.Partner_Price ?? null,
    link: p.link,
  }));

  useEffect(() => {
    doFetchUsdRate(fetchUsdToRialRate, setUsdRate);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(t);
  }, [keyword]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  const formatToman = (usd: number) => {
    if (!usdRate) return "-";
    return Math.floor(usd * usdRate).toLocaleString("fa-IR") + " تومان";
  };

  const filtered = (() => {
    const q = debouncedKeyword.trim().toLowerCase();
    if (!q) return data;
    return data.filter((r) => r.Type.toLowerCase().includes(q));
  })();

  const sorted = (() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let va: number | string = "";
      let vb: number | string = "";
      if (sortKey === "Type") {
        va = a.Type;
        vb = b.Type;
      } else if (sortKey === "Original") {
        va = calcOriginal(a);
        vb = calcOriginal(b);
      } else {
        va = a.Partner_Price ? parseFloat(a.Partner_Price) : -Infinity;
        vb = b.Partner_Price ? parseFloat(b.Partner_Price) : -Infinity;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  })();

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = (() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  })();

  const setSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="w-full text-white">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">قیمت‌های همکار</h1>
        <input
          type="search"
          name="product-search"
          autoComplete="off"
          placeholder="جستجوی نام محصول…"
          aria-label="جستجوی محصول"
          className="min-h-11 w-full rounded-md border border-slate-500 bg-slate-700 px-3 py-2 text-base text-white placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none md:w-80"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {!loading && !error && !usdRate && (
        <div role="status" className="mb-4 rounded-md bg-amber-700/80 p-3 text-sm">
          <strong>توجه:</strong> نرخ دلار به تومان قابل دریافت نیست. قیمت‌ها به دلار نمایش داده
          می‌شوند.
        </div>
      )}

      <div
        className="overflow-x-auto rounded-lg bg-slate-700"
        role="region"
        aria-label="فهرست قیمت‌های همکار"
        tabIndex={0}
      >
        <table className="w-full min-w-176 table-auto text-sm">
          <thead className="sticky top-0 z-10 bg-slate-800 text-gray-100">
            <tr>
              <th
                aria-sort={
                  sortKey === "Type" ? (sortDir === "asc" ? "ascending" : "descending") : "none"
                }
              >
                <button
                  type="button"
                  className="w-full px-4 py-3 text-start transition-colors hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none motion-reduce:transition-none"
                  onClick={() => setSort("Type")}
                >
                  نام محصول {sortKey === "Type" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th
                aria-sort={
                  sortKey === "Original" ? (sortDir === "asc" ? "ascending" : "descending") : "none"
                }
              >
                <button
                  type="button"
                  className="w-full px-4 py-3 transition-colors hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none motion-reduce:transition-none"
                  onClick={() => setSort("Original")}
                >
                  قیمت ({usdRate ? "تومان" : "دلار"})
                  {sortKey === "Original" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </button>
              </th>
              <th
                aria-sort={
                  sortKey === "Partner" ? (sortDir === "asc" ? "ascending" : "descending") : "none"
                }
              >
                <button
                  type="button"
                  className="w-full px-4 py-3 text-center transition-colors hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none motion-reduce:transition-none"
                  onClick={() => setSort("Partner")}
                >
                  قیمت همکار ({usdRate ? "تومان" : "دلار"}){" "}
                  {sortKey === "Partner" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th className="px-4 py-3 text-center">لینک محصول</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-200">
                  در حال بارگذاری...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-red-300" role="alert">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-3 rounded-md bg-slate-800 px-4 py-2 text-white transition-colors hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none motion-reduce:transition-none"
                  >
                    تلاش مجدد
                  </button>
                </td>
              </tr>
            )}
            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-300" role="status">
                  آیتمی یافت نشد
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              paged.map((p) => (
                <tr key={p.ProductId} className="odd:bg-slate-600 even:bg-slate-700">
                  <td className="px-4 py-3">{p.Type}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const price = p.Price;
                      const discount = p.Discount;
                      if (!price || price === 0) {
                        return (
                          <span className="flex justify-center text-gray-300 italic">
                            بدون قیمت
                          </span>
                        );
                      }
                      if (discount && discount > 0) {
                        const discountedUsd = Math.max(price - discount, 0);
                        const originalToman = formatToman(price);
                        const discountedToman = formatToman(discountedUsd);
                        return (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-red-300 line-through">
                              {originalToman === "-"
                                ? `${price.toLocaleString("fa-IR")} دلار`
                                : originalToman}
                            </span>
                            <span className="font-semibold text-green-400">
                              {discountedToman === "-"
                                ? `${discountedUsd.toLocaleString("fa-IR")} دلار`
                                : discountedToman}
                            </span>
                          </div>
                        );
                      }
                      return <span>{formatToman(price)}</span>;
                    })()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-semibold text-gray-200">
                        {!p.Partner_Price
                          ? "بدون قیمت"
                          : usdRate
                            ? formatToman(parseFloat(p.Partner_Price))
                            : `${parseFloat(p.Partner_Price).toLocaleString("fa-IR")} دلار`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/products/${p.link}`}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1 text-white transition-colors hover:bg-emerald-700"
                    >
                      مشاهده محصول
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && !error && (
          <div className="flex items-center justify-between p-3 text-sm text-gray-200">
            <span>
              صفحه {page} از {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md bg-slate-800 px-3 py-1 disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                قبلی
              </button>
              <button
                type="button"
                className="rounded-md bg-slate-800 px-3 py-1 disabled:opacity-50"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
