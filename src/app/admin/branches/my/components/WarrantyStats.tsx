"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Spin,
  Alert,
  Statistic,
  Row,
  Col,
  Typography,
  Empty,
} from "antd";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface BranchStats {
  branchid: number;
  branch_name: string;
  active_count: number;
  expired_count: number;
  requested_count: number;
}

interface WarrantyStatsProps {
  isTabActive?: boolean;
}

export default function WarrantyStats({
  isTabActive = true,
}: WarrantyStatsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statistics, setStatistics] = useState<BranchStats[]>([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchWarrantyStats = async (retry: boolean = false) => {
    if (!isTabActive && dataFetched) return;

    try {
      setLoading(true);
      const response = await fetch("/api/admin/warranty/statistics", {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch warranty statistics: ${response.status}`
        );
      }

      const data = await response.json();
      // Check if data.myBranches exists and is an array
      const stats = Array.isArray(data.myBranches) ? data.myBranches : [];
      setStatistics(stats);
      setDataFetched(true);
      setError("");
    } catch (err: any) {
      console.error("Error fetching warranty stats:", err);
      setError(err.message || "خطا در دریافت آمار گارانتی‌ها");

      // If this is the first error, retry once automatically
      if (!retry && retryCount < 2) {
        setRetryCount((prev) => prev + 1);
        setTimeout(() => fetchWarrantyStats(true), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTabActive && !dataFetched) {
      fetchWarrantyStats();
    }
  }, [isTabActive, dataFetched]);

  // Calculate total statistics for the branch
  const totalStats = statistics.reduce(
    (acc, branch) => {
      acc.active += branch.active_count || 0;
      acc.expired += branch.expired_count || 0;
      acc.requested += branch.requested_count || 0;
      return acc;
    },
    { active: 0, expired: 0, requested: 0 }
  );

  const handleRetry = () => {
    setDataFetched(false);
    fetchWarrantyStats();
  };

  if (!isTabActive && !dataFetched) {
    return null; // Don't render anything if tab is not active and data hasn't been fetched yet
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="خطا"
        description={
          <div className="flex flex-col space-y-3">
            <p>{error}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded flex items-center w-fit"
            >
              <ReloadOutlined className="ml-1" /> تلاش مجدد
            </button>
          </div>
        }
        type="error"
        showIcon
      />
    );
  }

  if (statistics.length === 0 && dataFetched) {
    return <Empty description="هیچ آماری موجود نیست" />;
  }

  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-xl warranty-stats-wrapper">
      {/* Total Statistics Summary - Row Layout */}

      {/* Detailed breakdown for each period */}
      {statistics.length > 0 && (
        <Card
          className="border-0 shadow-md"
          style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
          title={
            <div className="flex justify-between items-center">
              <Title level={5} className="!text-white">
                جزئیات آماری شعبه {statistics[0].branch_name}
              </Title>
              <button
                onClick={handleRetry}
                className="text-blue-400 hover:text-blue-300 flex items-center"
              >
                <ReloadOutlined className="ml-1" /> بروزرسانی
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <Text className="text-gray-300 block mb-2">گارانتی‌های فعال</Text>
              <Text className="text-green-500 text-3xl font-bold block">
                {statistics[0]?.active_count || 0}
              </Text>
            </div>
            <div>
              <Text className="text-gray-300 block mb-2">
                گارانتی‌های منقضی شده
              </Text>
              <Text className="text-red-500 text-3xl font-bold block">
                {statistics[0]?.expired_count || 0}
              </Text>
            </div>
            <div>
              <Text className="text-gray-300 block mb-2">
                درخواست‌های بررسی
              </Text>
              <Text className="text-yellow-500 text-3xl font-bold block">
                {statistics[0]?.requested_count || 0}
              </Text>
            </div>
          </div>
        </Card>
      )}

      <style jsx global>{`
        .warranty-stats-wrapper {
          font-family: inherit !important;
        }

        .warranty-stats-wrapper * {
          font-family: inherit !important;
        }

        .ant-card-head-title,
        .ant-statistic-title {
          color: #e5e7eb !important;
        }

        .ant-statistic-content-value-int {
          font-size: 2rem;
        }

        .ant-card {
          border-radius: 8px;
          overflow: hidden;
        }

        .ant-card-head {
          background-color: rgba(31, 41, 55, 0.9);
        }

        /* Fix font-family issues */
        .ant-card,
        .ant-card-head,
        .ant-card-head-title,
        .ant-card-body,
        .ant-statistic,
        .ant-statistic-title,
        .ant-statistic-content,
        .ant-typography,
        .ant-spin,
        .ant-alert {
          font-family: inherit !important;
        }

        /* Ensure numeric values also use the right font */
        .ant-statistic-content-value-int,
        .ant-statistic-content-value-decimal {
          font-family: inherit !important;
        }
      `}</style>
    </div>
  );
}
