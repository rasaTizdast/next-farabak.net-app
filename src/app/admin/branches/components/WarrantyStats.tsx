"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Spin,
  Alert,
  Statistic,
  Row,
  Col,
  Typography,
  Empty,
  Button,
} from "antd";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  TeamOutlined,
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

export default function WarrantyStats({ isTabActive = true }: WarrantyStatsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statistics, setStatistics] = useState<BranchStats[]>([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Create a memoized fetch function using useCallback
  const fetchWarrantyStats = useCallback(async (force = false) => {
    // Skip if not active and not forced
    if (!isTabActive && !force) return;
    
    // Skip if we've fetched in the last 10 seconds and not forced
    const now = Date.now();
    if (!force && now - lastFetchTime < 10000 && dataFetched) return;
    
    console.log("[Client] Fetching warranty statistics...");
    try {
      setLoading(true);
      const response = await fetch("/api/admin/warranty/statistics");

      if (!response.ok) {
        throw new Error("Failed to fetch warranty statistics");
      }

      const data = await response.json();
      console.log("[Client] Warranty statistics received:", data);
      
      // Use either allBranches or myBranches, whichever has data
      const stats = data.allBranches?.length > 0 ? data.allBranches : data.myBranches || [];
      console.log("[Client] Setting statistics:", stats);
      setStatistics(stats);
      setDataFetched(true);
      setLastFetchTime(now);
    } catch (err: any) {
      console.error("[Client] Error fetching warranty stats:", err);
      setError(err.message || "خطا در دریافت آمار گارانتی‌ها");
    } finally {
      setLoading(false);
    }
  }, [isTabActive, lastFetchTime, dataFetched]);

  // Effect to fetch data when tab becomes active
  useEffect(() => {
    console.log("[Client] WarrantyStats tab active state changed:", isTabActive);
    if (isTabActive) {
      fetchWarrantyStats(false);
    }
  }, [isTabActive, fetchWarrantyStats]);

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
              type="primary" 
              onClick={() => fetchWarrantyStats(true)} 
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
    <div className="space-y-6 bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-xl warranty-stats-wrapper">
      {/* Refresh Button */}
      <div className="flex justify-end mb-2">
        <Button 
          onClick={() => fetchWarrantyStats(true)} 
          icon={<ReloadOutlined />} 
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          بروزرسانی
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      ) : statistics.length === 0 ? (
        <Empty description="هیچ آماری موجود نیست" />
      ) : (
        <>
          {/* Total Statistics Summary - Row Layout */}
          <Card
            className="border-0 shadow-lg mb-6"
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
                  className="text-center h-full border-0"
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
                  className="text-center h-full border-0"
                  style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
                >
                  <Statistic
                    title={
                      <Text className="text-gray-300">گارانتی‌های منقضی شده</Text>
                    }
                    value={totalStats.expired}
                    valueStyle={{ color: "#EF4444", fontWeight: "bold" }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card
                  className="text-center h-full border-0"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statistics.map((branch) => (
              <Card
                key={branch.branchid}
                title={
                  <div className="flex items-center">
                    <TeamOutlined className="text-blue-500 ml-2" />
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
                    <Text className="text-gray-300 block text-sm">فعال</Text>
                    <Text className="text-green-500 text-lg font-bold">
                      {branch.active_count}
                    </Text>
                  </div>
                  <div className="text-center">
                    <Text className="text-gray-300 block text-sm">منقضی شده</Text>
                    <Text className="text-red-500 text-lg font-bold">
                      {branch.expired_count}
                    </Text>
                  </div>
                  <div className="text-center">
                    <Text className="text-gray-300 block text-sm">درخواست‌ها</Text>
                    <Text className="text-yellow-500 text-lg font-bold">
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
