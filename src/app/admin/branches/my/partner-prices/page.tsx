"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

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
  } = useApiFetch<ApiResponse>("/api/admin/products?limit=500");

  const data: ProductRow[] = (apiData?.data || []).map((p: any) => ({
    ProductId: p.ProductId,
    Type: p.Type,
    Price: Number(p.Price ?? 0),
    Discount: Number(p.Discount ?? 0),
    Partner_Price: p.Partner_Price ?? null,
    link: p.link,
  }));

  async function doFetchUsdRate(
    fetchUsdToRialRate: () => Promise<number>,
    setUsdRate: (rate: number) => void
  ) {
    try {
      const rate = await fetchUsdToRialRate();
      if (rate && rate > 0) setUsdRate(rate);
    } catch {}
  }

  useEffect(() => {
    doFetchUsdRate(fetchUsdToRialRate, setUsdRate);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(t);
  }, [keyword]);

  const filtered = useMemo(() => {
    const q = debouncedKeyword.trim().toLowerCase();
    if (!q) return data;
    return data.filter((r) => r.Type.toLowerCase().includes(q));
  }, [data, debouncedKeyword]);

  const calcOriginal = (p: ProductRow) => {
    const price = p.Price || 0;
    const discount = p.Discount || 0;
    return Math.max(price - discount, 0);
  };

  const formatRial = (usd: number) => {
    if (!usdRate) return "-";
    return (usd * usdRate).toLocaleString("fa-IR") + " تومان";
  };

  const sorted = useMemo(() => {
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
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  const setSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] text-white">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">قیمت‌های همکار</h1>
        <input
          placeholder="جستجو نام محصول..."
          className="w-full rounded-md bg-slate-700 px-3 py-2 text-sm outline-none placeholder:text-gray-300 md:w-80"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {!loading && !usdRate && (
        <div className="mb-4 rounded-md bg-red-700/80 p-3 text-sm">
          <strong>توجه:</strong> نرخ دلار به ریال قابل دریافت نیست. قیمت‌ها به دلار نمایش داده
          می‌شوند.
        </div>
      )}

      <div className="overflow-x-auto rounded-lg bg-slate-700">
        <table className="w-full table-auto text-sm">
          <thead className="sticky top-0 z-10 bg-slate-800 text-gray-100">
            <tr>
              <th className="cursor-pointer px-4 py-3" onClick={() => setSort("Type")}>
                نام محصول {sortKey === "Type" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="cursor-pointer px-4 py-3" onClick={() => setSort("Original")}>
                قیمت (ریال)
                {sortKey === "Original" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-center"
                onClick={() => setSort("Partner")}
              >
                قیمت همکار {sortKey === "Partner" ? (sortDir === "asc" ? "▲" : "▼") : ""}
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
                <td colSpan={4} className="px-4 py-6 text-center text-red-300">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-300">
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
                          <span className="flex justify-center italic text-gray-300">
                            بدون قیمت
                          </span>
                        );
                      }
                      if (discount && discount > 0) {
                        const discountedUsd = Math.max(price - discount, 0);
                        return (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-red-300 line-through">
                              {formatRial(price) === "-"
                                ? `${price.toLocaleString("fa-IR")} دلار`
                                : formatRial(price)}
                            </span>
                            <span className="font-semibold text-green-400">
                              {formatRial(discountedUsd) === "-"
                                ? `${discountedUsd.toLocaleString("fa-IR")} دلار`
                                : formatRial(discountedUsd)}
                            </span>
                          </div>
                        );
                      }
                      return <span>{formatRial(price)}</span>;
                    })()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-semibold text-gray-200">
                        {!p.Partner_Price
                          ? "بدون قیمت"
                          : usdRate
                            ? formatRial(parseFloat(p.Partner_Price))
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
