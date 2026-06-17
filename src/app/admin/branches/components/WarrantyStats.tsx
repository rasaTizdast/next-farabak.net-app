"use client";

import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  TeamOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Card, Spin, Alert, Statistic, Row, Col, Typography, Empty, Button } from "antd";

import { useApiFetch } from "@/hooks/useApiFetch";

const { Title, Text } = Typography;

interface BranchStats {
  branchid: number;
  branch_name: string;
  active_count: number;
  expired_count: number;
  requested_count: number;
}

interface StatsResponse {
  allBranches?: BranchStats[];
  myBranches?: BranchStats[];
}

interface WarrantyStatsProps {
  isTabActive?: boolean;
}

export default function WarrantyStats({ isTabActive = true }: WarrantyStatsProps) {
  const { data, loading, error, refetch } = useApiFetch<StatsResponse>(
    isTabActive ? "/api/admin/warranty/statistics" : null,
    true
  );

  const statistics: BranchStats[] =
    (data?.allBranches?.length ? data.allBranches : data?.myBranches) || [];

  // Calculate total statistics across all branches
  const totalStats = statistics.reduce(
    (acc, branch) => {
      acc.active += branch.active_count;
      acc.expired += branch.expired_count;
      acc.requested += branch.requested_count;
      return acc;
    },
    { active: 0, expired: 0, requested: 0 }
  );

  if (!isTabActive && !dataFetched) {
    return null; // Don't render anything if tab is not active and data hasn't been fetched yet
  }

  if (error) {
    return (
      <Alert
        message="خطا"
        description={
          <div>
            <p>{error}</p>
            <Button
              htmlType="button"
              type="primary"
              onClick={() => refetch()}
              icon={<ReloadOutlined />}
              className="mt-4"
            >
              تلاش مجدد
            </Button>
          </div>
        }
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="warranty-stats-wrapper space-y-6 rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-xl">
      {/* Refresh Button */}
      <div className="mb-2 flex justify-end">
        <Button
          htmlType="button"
          onClick={() => refetch()}
          icon={<ReloadOutlined />}
          loading={loading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          بروزرسانی
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      ) : statistics.length === 0 ? (
        <Empty description="هیچ آماری موجود نیست" />
      ) : (
        <>
          {/* Total Statistics Summary - Row Layout */}
          <Card
            className="mb-6 border-0 shadow-lg"
            style={{ backgroundColor: "#121f3b", borderColor: "#374151" }}
            title={
              <Title level={4} className="!text-white">
                آمار کلی گارانتی‌ها
              </Title>
            }
          >
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} md={8}>
                <Card
                  className="h-full border-0 text-center"
                  style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
                >
                  <Statistic
                    title={<Text className="text-gray-300">گارانتی‌های فعال</Text>}
                    value={totalStats.active}
                    valueStyle={{ color: "#10B981", fontWeight: "bold" }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card
                  className="h-full border-0 text-center"
                  style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
                >
                  <Statistic
                    title={<Text className="text-gray-300">گارانتی‌های منقضی شده</Text>}
                    value={totalStats.expired}
                    valueStyle={{ color: "#EF4444", fontWeight: "bold" }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card
                  className="h-full border-0 text-center"
                  style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
                >
                  <Statistic
                    title={<Text className="text-gray-300">درخواست‌های بررسی</Text>}
                    value={totalStats.requested}
                    valueStyle={{ color: "#F59E0B", fontWeight: "bold" }}
                    prefix={<SyncOutlined spin />}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Individual Branch Statistics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {statistics.map((branch) => (
              <Card
                key={branch.branchid}
                title={
                  <div className="flex items-center">
                    <TeamOutlined className="ml-2 text-blue-500" />
                    <Text strong className="text-white">
                      {branch.branch_name}
                    </Text>
                  </div>
                }
                className="border-0 shadow-md"
                style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
                headStyle={{ borderBottom: "1px solid #374151" }}
              >
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <Text className="block text-sm text-gray-300">فعال</Text>
                    <Text className="text-lg font-bold text-green-500">{branch.active_count}</Text>
                  </div>
                  <div className="text-center">
                    <Text className="block text-sm text-gray-300">منقضی شده</Text>
                    <Text className="text-lg font-bold text-red-500">{branch.expired_count}</Text>
                  </div>
                  <div className="text-center">
                    <Text className="block text-sm text-gray-300">درخواست‌ها</Text>
                    <Text className="text-lg font-bold text-yellow-500">
                      {branch.requested_count}
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
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
