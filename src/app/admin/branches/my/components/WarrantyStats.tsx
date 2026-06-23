"use client";

import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";
import { Card, Spin, Alert, Typography, Empty } from "antd";

import { useApiFetch } from "@/hooks/useApiFetch";

const { Title, Text } = Typography;

interface BranchStats {
  branchid: number;
  branch_name: string;
  active_count: number;
  expired_count: number;
  requested_count: number;
}

interface BranchStatsResponse {
  myBranches?: BranchStats[];
}

interface WarrantyStatsProps {
  isTabActive?: boolean;
}

export default function WarrantyStats({ isTabActive = true }: WarrantyStatsProps) {
  const url = isTabActive ? "/api/admin/warranty/statistics" : null;
  const { data, loading, error, refetch } = useApiFetch<BranchStatsResponse>(url, true, {
    headers: { "Cache-Control": "no-cache" },
  });

  const statistics: BranchStats[] = Array.isArray(data?.myBranches) ? data!.myBranches : [];
  const dataFetched = data !== null;

  const handleRetry = () => {
    refetch();
  };

  if (!isTabActive && !dataFetched) {
    return null; // Don't render anything if tab is not active and data hasn't been fetched yet
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
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
              type="button"
              onClick={handleRetry}
              className="flex w-fit items-center rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
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
    <div className="warranty-stats-wrapper space-y-6 rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-xl">
      {/* Total Statistics Summary - Row Layout */}

      {/* Detailed breakdown for each period */}
      {statistics.length > 0 && (
        <Card
          className="border-0 shadow-md"
          style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
          title={
            <div className="flex items-center justify-between">
              <Title level={5} className="!text-white">
                جزئیات آماری شعبه {statistics[0].branch_name}
              </Title>
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center text-blue-400 hover:text-blue-300"
              >
                <ReloadOutlined className="ml-1" /> بروزرسانی
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <Text className="mb-2 block text-gray-300">گارانتی‌های فعال</Text>
              <Text className="block text-3xl font-bold text-green-500">
                {statistics[0]?.active_count || 0}
              </Text>
            </div>
            <div>
              <Text className="mb-2 block text-gray-300">گارانتی‌های منقضی شده</Text>
              <Text className="block text-3xl font-bold text-red-500">
                {statistics[0]?.expired_count || 0}
              </Text>
            </div>
            <div>
              <Text className="mb-2 block text-gray-300">درخواست‌های بررسی</Text>
              <Text className="block text-3xl font-bold text-yellow-500">
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
