"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiFileText, FiBox, FiArrowRightCircle, FiDollarSign } from "react-icons/fi";

import { ErrorPage } from "@/components/ui/ErrorPage";
import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";
import { cn } from "@/lib/utils";

type ReportData = {
  invoiceCount: number;
  productCount: {
    available: number;
    unavailable: number;
  };
  invoiceStatusCount: {
    checked: number;
    unchecked: number;
  };
};

// Skeleton loader component (mirrors the real card layout: same grid + 5 cards)
const SkeletonCard = () => (
  <div
    aria-hidden="true"
    className="glass-card animate-pulse rounded-lg p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
  >
    <div className="h-6 w-3/4 rounded-md bg-blue-200/50"></div>
    <div className="mt-4 h-8 w-1/2 rounded-md bg-blue-200/50"></div>
    <div className="mt-2 h-4 w-full rounded-md bg-blue-200/50"></div>
  </div>
);

const getPercentage = (part: number, whole: number) =>
  whole > 0 ? `${(part / whole) * 100}%` : "0%";

const AdminPage = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [usdToRialRate, setUsdToRialRate] = useState<number | null>(null);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch("/api/admin/report/landingReport");
        if (response.ok) {
          const data = await response.json();
          setReportData(data);
        } else {
          setError("خطا در دریافت اطلاعات");
        }
      } catch {
        setError("خطا در دریافت اطلاعات");
      }
    };

    const fetchExchangeRate = async () => {
      try {
        const rate = await fetchUsdToRialRate();
        setUsdToRialRate(rate);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        setUsdToRialRate(null);
      } finally {
        setIsExchangeRateLoading(false);
      }
    };

    fetchReportData();
    fetchExchangeRate();
  }, []);

  const handleRetry = () => {
    setError(null);
    setReportData(null);
    fetch("/api/admin/report/landingReport")
      .then(async (response) => {
        if (response.ok) {
          setReportData(await response.json());
        } else {
          setError("خطا در دریافت اطلاعات");
        }
      })
      .catch(() => setError("خطا در دریافت اطلاعات"));
  };

  if (error) {
    return (
      <div className={cn("space-y-6")}>
        <header className="mb-6">
          <h1 className="text-xl font-bold text-white sm:text-2xl">داشبورد مدیریت</h1>
        </header>
        <ErrorPage
          title="خطا در دریافت اطلاعات"
          message="لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className={cn("space-y-6")} role="status" aria-live="polite">
        <header className="mb-6">
          <h1 className="text-xl font-bold text-white sm:text-2xl">داشبورد مدیریت</h1>
          <p className="text-sm text-gray-300">نمای کلی عملکرد فروشگاه</p>
        </header>
        <span className="sr-only">در حال بارگذاری اطلاعات</span>
        <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3")}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6")}>
      <header className="mb-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl">داشبورد مدیریت</h1>
        <p className="text-sm text-gray-300">نمای کلی عملکرد فروشگاه</p>
      </header>
      {/* Bento Grid */}
      <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3")}>
        {/* USD to Rial Exchange Rate */}
        <div
          className={cn(
            "glass-card flex flex-col justify-between rounded-lg p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-shadow duration-300 hover:shadow-lg"
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">نرخ دلار به تومان</h3>
            <FiDollarSign className="text-secondary text-3xl" />
          </div>
          <span className="text-secondary mt-4 text-4xl font-extrabold">
            {usdToRialRate !== null
              ? `${Math.floor(usdToRialRate).toLocaleString()} تومان`
              : isExchangeRateLoading
                ? "در حال دریافت..."
                : "دریافت نرخ ناموفق بود"}
          </span>
        </div>

        {/* Invoice Count */}
        <div
          className={cn(
            "glass-card bg-dark-blue/90 flex flex-col justify-between rounded-lg p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-shadow duration-300 hover:shadow-lg"
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">تعداد فاکتورها</h3>
            <FiFileText className="text-primary text-3xl" />
          </div>
          <span className="text-primary mt-4 text-5xl font-extrabold">
            {reportData.invoiceCount}
          </span>
        </div>

        {/* Invoice Status */}
        <div
          className={cn(
            "glass-card bg-dark-blue/90 flex flex-col justify-between rounded-lg p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-shadow duration-300 hover:shadow-lg"
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">وضعیت فاکتورها</h3>
            <FiFileText className="text-primary text-3xl" />
          </div>
          <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-green-500">
            <div
              className="bg-primary h-4 rounded-full"
              aria-hidden="true"
              style={{
                width: getPercentage(
                  reportData.invoiceStatusCount.checked,
                  reportData.invoiceStatusCount.checked + reportData.invoiceStatusCount.unchecked
                ),
              }}
            />
          </div>
          <div className="text-primary mt-2 flex w-full justify-between text-sm">
            <span>تایید شده: {reportData.invoiceStatusCount.checked}</span>
            <span>تایید نشده: {reportData.invoiceStatusCount.unchecked}</span>
          </div>
        </div>

        {/* Product Availability */}
        <div
          className={cn(
            "glass-card bg-dark-blue/90 flex flex-col justify-between rounded-lg p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-shadow duration-300 hover:shadow-lg"
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">محصولات</h3>
            <FiBox className="text-primary text-3xl" />
          </div>
          <div className="bg-primary mt-4 h-4 w-full overflow-hidden rounded-full">
            <div
              className="bg-secondary h-4 rounded-full"
              aria-hidden="true"
              style={{
                width: getPercentage(
                  reportData.productCount.available,
                  reportData.productCount.available + reportData.productCount.unavailable
                ),
              }}
            />
          </div>
          <div className="text-primary mt-2 flex w-full justify-between text-sm">
            <span>موجود: {reportData.productCount.available}</span>
            <span>ناموجود: {reportData.productCount.unavailable}</span>
          </div>
        </div>

        {/* Navigate to Products */}
        <Link
          href="/admin/products"
          className={cn(
            "glass-card flex flex-col justify-between rounded-lg p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-shadow duration-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200"
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">میخواهید محصولات را ببینید؟</h3>
            <FiArrowRightCircle className="text-3xl text-blue-200" />
          </div>
          <div className="mt-4 text-blue-200 transition hover:text-blue-100">مشاهده محصولات</div>
        </Link>

        {/* Navigate to Invoices */}
        <Link
          href="/admin/invoices"
          className={cn(
            "glass-card flex flex-col justify-between rounded-lg p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-shadow duration-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200"
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">میخواهید فاکتورها را ببینید؟</h3>
            <FiArrowRightCircle className="text-3xl text-blue-200" />
          </div>
          <div className="mt-4 text-blue-200 transition hover:text-blue-100">مشاهده فاکتورها</div>
        </Link>
      </div>
    </div>
  );
};

export default AdminPage;
