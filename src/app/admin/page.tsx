"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiFileText, FiBox, FiArrowRightCircle, FiDollarSign } from "react-icons/fi";

import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";

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

// Skeleton loader component
const SkeletonCard = () => (
  <div className="glass-card animate-pulse rounded-lg bg-blue-700 p-6 shadow-md">
    <div className="h-6 w-3/4 rounded-md bg-blue-200/50"></div>
    <div className="mt-4 h-8 w-1/2 rounded-md bg-blue-200/50"></div>
    <div className="mt-2 h-4 w-full rounded-md bg-blue-200/50"></div>
  </div>
);

const AdminPage = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [usdToRialRate, setUsdToRialRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      const response = await fetch("/api/admin/report/landingReport");
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        throw new Error("Failed to fetch report data");
      }
    };

    const fetchExchangeRate = async () => {
      try {
        const rate = await fetchUsdToRialRate();
        if (rate !== null) {
          setUsdToRialRate(rate);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    };

    fetchReportData();
    fetchExchangeRate();
  }, []);

  if (!reportData) {
    return (
      <div className="sm:space-y-3 sm:p-3 md:space-y-6 md:p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
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
    <div className="sm:space-y-3 sm:p-3 md:space-y-6 md:p-6">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* USD to Rial Exchange Rate */}
        <div className="glass-card flex transform flex-col justify-between rounded-lg p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">نرخ دلار به تومان</h3>
            <FiDollarSign className="text-3xl text-green-300" />
          </div>
          <span className="mt-4 text-4xl font-extrabold text-green-200">
            {usdToRialRate ? `${usdToRialRate.toLocaleString()} تومان` : "در حال دریافت..."}
          </span>
        </div>

        {/* Invoice Count */}
        <div className="glass-card flex transform flex-col justify-between rounded-lg bg-blue-700/90 p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">تعداد فاکتورها</h3>
            <FiFileText className="text-3xl text-blue-200" />
          </div>
          <span className="mt-4 text-5xl font-extrabold text-blue-100">
            {reportData.invoiceCount}
          </span>
        </div>

        {/* Invoice Status */}
        <div className="glass-card flex transform flex-col justify-between rounded-lg bg-blue-600/90 p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">وضعیت فاکتورها</h3>
            <FiFileText className="text-3xl text-blue-200" />
          </div>
          <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-blue-800">
            <div
              className="h-4 rounded-full bg-green-500"
              style={{
                width: `${
                  (reportData.invoiceStatusCount.checked /
                    (reportData.invoiceStatusCount.checked +
                      reportData.invoiceStatusCount.unchecked)) *
                  100
                }%`,
              }}
            />
          </div>
          <div className="mt-2 flex w-full justify-between text-sm text-blue-200">
            <span>تایید شده: {reportData.invoiceStatusCount.checked}</span>
            <span>تایید نشده: {reportData.invoiceStatusCount.unchecked}</span>
          </div>
        </div>

        {/* Product Availability */}
        <div className="glass-card flex transform flex-col justify-between rounded-lg bg-blue-500/90 p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">محصولات</h3>
            <FiBox className="text-3xl text-blue-200" />
          </div>
          <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-blue-800">
            <div
              className="h-4 rounded-full bg-cyan-400"
              style={{
                width: `${
                  (reportData.productCount.available /
                    (reportData.productCount.available + reportData.productCount.unavailable)) *
                  100
                }%`,
              }}
            />
          </div>
          <div className="mt-2 flex w-full justify-between text-sm text-blue-200">
            <span>موجود: {reportData.productCount.available}</span>
            <span>ناموجود: {reportData.productCount.unavailable}</span>
          </div>
        </div>

        {/* Navigate to Products */}
        <Link
          href="/admin/products"
          className="glass-card flex transform flex-col justify-between rounded-lg bg-blue-400/90 p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
          className="glass-card flex transform flex-col justify-between rounded-lg bg-blue-300/90 p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
