"use client";

import { message } from "antd";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { useApiFetch } from "@/hooks/useApiFetch";

type ProductRow = {
  ProductId: number;
  Type: string;
  Price: number;
  Discount: number;
  Partner_Price?: string | null;
  link: string;
};

const partnerPricePattern = /^(?:\d+\.?\d*|\.\d+)$/;

function normalizePartnerPriceInput(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/٫/g, ".");
}

function calcOriginal(p: ProductRow) {
  const price = p.Price || 0;
  const discount = p.Discount || 0;
  return Math.max(price - discount, 0);
}

type ProductApiResponse = {
  ProductId: number;
  Type: string;
  Price: number | null;
  Discount: number | null;
  Partner_Price: string | null;
  link: string;
};

async function fetchPartnerPrices(
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setData: React.Dispatch<React.SetStateAction<ProductRow[]>>,
  setPartnerValues: React.Dispatch<React.SetStateAction<Record<number, string>>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  try {
    setLoading(true);
    setError(null);
    const res = await axios.get<{ data: ProductApiResponse[] }>("/api/admin/products", {
      params: { limit: 500 },
    });
    const rows = (res.data?.data || []).map((p: ProductApiResponse) => ({
      ProductId: p.ProductId,
      Type: p.Type,
      Price: Number(p.Price ?? 0),
      Discount: Number(p.Discount ?? 0),
      Partner_Price: p.Partner_Price ?? null,
      link: p.link,
    })) as ProductRow[];
    setData(rows);
    const initial: Record<number, string> = {};
    rows.forEach((r) => {
      initial[r.ProductId] = r.Partner_Price ?? "";
    });
    setPartnerValues(initial);
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : "خطا در دریافت اطلاعات");
  } finally {
    setLoading(false);
  }
}

async function updatePartnerPrice(
  productId: number,
  partnerPrice: string,
  setUpdatingId: React.Dispatch<React.SetStateAction<number | null>>,
  fetchData: () => Promise<void>
) {
  const trimmed = partnerPrice.trim();
  if (trimmed !== "" && (!partnerPricePattern.test(trimmed) || !Number.isFinite(Number(trimmed)))) {
    message.error("ورودی نامعتبر است. فقط عدد و اعشار مجاز است.");
    return;
  }
  try {
    setUpdatingId(productId);
    await axios.patch(`/api/admin/products/${productId}`, { Partner_Price: trimmed });
    await fetchData();
    message.success("قیمت همکار با موفقیت ذخیره شد.");
  } catch (e) {
    console.error(e);
    message.error("ذخیره قیمت با خطا مواجه شد.");
  } finally {
    setUpdatingId(null);
  }
}

export default function AdminPartnerPricesPage() {
  const [data, setData] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [sortKey, setSortKey] = useState<"Type" | "Original" | "Partner">("Type");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [partnerValues, setPartnerValues] = useState<Record<number, string>>({});

  const fetchData = async () => {
    await fetchPartnerPrices(setLoading, setData, setPartnerValues, setError);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { data: usdRateData } = useApiFetch<{ rate: number | null }>("/api/exchangeRate");
  const usdRate = usdRateData?.rate ?? null;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(t);
  }, [keyword]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  const filtered = (() => {
    const q = debouncedKeyword.trim().toLowerCase();
    if (!q) return data;
    return data.filter((r) => r.Type.toLowerCase().includes(q));
  })();

  const formatRial = (usd: number) => {
    if (!usdRate) return "-";
    return Math.floor(usd * usdRate).toLocaleString("fa-IR") + " تومان";
  };

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

  const handleUpdate = async (productId: number, partnerPrice: string) => {
    await updatePartnerPrice(productId, partnerPrice, setUpdatingId, fetchData);
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
          className="w-full rounded-md bg-slate-700 px-3 py-2 text-sm outline-none placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-blue-400 md:w-80"
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
              <th
                aria-sort={
                  sortKey === "Type" ? (sortDir === "asc" ? "ascending" : "descending") : "none"
                }
                className="px-4 py-3"
              >
                <button
                  type="button"
                  className="cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-400"
                  onClick={() => setSort("Type")}
                >
                  نام محصول {sortKey === "Type" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th
                aria-sort={
                  sortKey === "Original" ? (sortDir === "asc" ? "ascending" : "descending") : "none"
                }
                className="px-4 py-3 text-center"
              >
                <button
                  type="button"
                  className="cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-400"
                  onClick={() => setSort("Original")}
                >
                  قیمت اصلی با تخفیف
                  {sortKey === "Original" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </button>
              </th>
              <th
                aria-sort={
                  sortKey === "Partner" ? (sortDir === "asc" ? "ascending" : "descending") : "none"
                }
                className="px-4 py-3 text-center"
              >
                <button
                  type="button"
                  className="cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-400"
                  onClick={() => setSort("Partner")}
                >
                  قیمت همکار {sortKey === "Partner" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th className="px-4 py-3 text-center">لینک محصول</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={4}
                  role="status"
                  aria-live="polite"
                  className="px-4 py-6 text-center text-gray-200"
                >
                  در حال بارگذاری…
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td
                  colSpan={4}
                  role="alert"
                  aria-live="polite"
                  className="px-4 py-6 text-center text-red-300"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={fetchData}
                      className="rounded-md bg-slate-800 px-3 py-2 text-white hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      تلاش مجدد
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  role="status"
                  aria-live="polite"
                  className="px-4 py-6 text-center text-gray-300"
                >
                  آیتمی یافت نشد
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              paged.map((p) => (
                <tr key={p.ProductId} className="odd:bg-slate-600 even:bg-slate-700">
                  <td className="px-4 py-3">{p.Type}</td>
                  <td className="px-4 py-3 text-center">
                    {(() => {
                      const price = p.Price;
                      const discount = p.Discount;
                      if (!price || price === 0) {
                        return <span className="text-gray-300 italic">بدون قیمت</span>;
                      }
                      if (discount && discount > 0) {
                        const originalUsd = price;
                        const discountedUsd = Math.max(price - discount, 0);
                        return (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-red-300 line-through">
                              {originalUsd.toLocaleString("fa-IR")} دلار
                            </span>
                            <span className="font-semibold text-green-400">
                              {discountedUsd.toLocaleString("fa-IR")} دلار
                            </span>
                            <span className="text-xs text-gray-300">
                              {formatRial(discountedUsd)}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex flex-col items-start gap-0.5">
                          <span>{price.toLocaleString("fa-IR")} دلار</span>
                          <span className="text-xs text-gray-300">{formatRial(price)}</span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <input
                        value={partnerValues[p.ProductId] ?? ""}
                        name={`partner-price-${p.ProductId}`}
                        aria-label={`قیمت همکار برای ${p.Type}`}
                        inputMode="decimal"
                        autoComplete="off"
                        aria-invalid={
                          (partnerValues[p.ProductId] ?? "") !== "" &&
                          (!partnerPricePattern.test(partnerValues[p.ProductId] ?? "") ||
                            Number(partnerValues[p.ProductId]) < 0)
                        }
                        onChange={(e) => {
                          const value = normalizePartnerPriceInput(e.currentTarget.value);
                          setPartnerValues((prev) => ({
                            ...prev,
                            [p.ProductId]: value,
                          }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const target = e.target as HTMLInputElement;
                            if (
                              updatingId === null &&
                              String(p.Partner_Price ?? "") !== target.value
                            ) {
                              handleUpdate(p.ProductId, target.value);
                            }
                          }
                        }}
                        className="w-36 rounded-md bg-slate-800 px-2 py-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                        placeholder="قیمت به دلار…"
                        disabled={updatingId !== null}
                      />
                      <span className="text-sm text-gray-200">
                        {partnerValues[p.ProductId]
                          ? formatRial(parseFloat(partnerValues[p.ProductId] || "0"))
                          : "-"}
                      </span>
                      <button
                        type="button"
                        aria-label={`${updatingId === p.ProductId ? "در حال ذخیره قیمت برای" : "ذخیره قیمت برای"} ${p.Type}`}
                        aria-busy={updatingId === p.ProductId}
                        disabled={updatingId !== null}
                        onClick={() => {
                          const val = partnerValues[p.ProductId] ?? "";
                          if (String(p.Partner_Price ?? "") !== val) {
                            handleUpdate(p.ProductId, val);
                          }
                        }}
                        className={`rounded-md px-3 py-1 focus-visible:ring-2 focus-visible:ring-blue-400 ${
                          updatingId === p.ProductId
                            ? "bg-gray-500"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {updatingId === p.ProductId ? "در حال ذخیره…" : "ذخیره"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/products/${p.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1 text-white transition-colors hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-blue-400"
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
                className="rounded-md bg-slate-800 px-3 py-1 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                قبلی
              </button>
              <button
                type="button"
                className="rounded-md bg-slate-800 px-3 py-1 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50"
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
