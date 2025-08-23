"use client";

import {
  LoadingOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  UserOutlined,
  ReloadOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { Table, Spin, Alert, Tag, Typography, Pagination, Modal, Button } from "antd";
import { useState, useEffect, useCallback } from "react";

const { Text } = Typography;
const { confirm } = Modal;

interface WarrantyRequest {
  warrantyid: number;
  warrantycode: string;
  startdate: string;
  expirydate: string;
  status: string;
  branch_name: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
}

interface WarrantyRequestsProps {
  isTabActive?: boolean;
}

export default function WarrantyRequests({ isTabActive = true }: WarrantyRequestsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<WarrantyRequest[]>([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchRequests = useCallback(
    async (page: number = 1, pageSize: number = 10, force: boolean = false) => {
      // Skip if not active and not forced
      if (!isTabActive && !force) return;

      // Skip if we've fetched in the last 10 seconds and not forced
      const now = Date.now();
      if (!force && now - lastFetchTime < 10000 && dataFetched) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/admin/warranty/requests?page=${page}&limit=${pageSize}`);

        if (!response.ok) {
          throw new Error("Failed to fetch warranty requests");
        }

        const data = await response.json();

        setRequests(data.requests);
        setPagination({
          current: data.pagination.currentPage,
          pageSize: data.pagination.pageSize,
          total: data.pagination.totalCount,
          totalPages: data.pagination.totalPages,
        });
        setDataFetched(true);
        setLastFetchTime(now);
      } catch (err: any) {
        console.error("[Client] Error fetching warranty requests:", err);
        setError(err.message || "خطا در دریافت درخواست‌های گارانتی");
      } finally {
        setLoading(false);
      }
    },
    [isTabActive, dataFetched, lastFetchTime]
  );

  // Fetch data when the tab becomes active
  useEffect(() => {
    if (isTabActive) {
      fetchRequests(pagination.current, pagination.pageSize, false);
    }
  }, [isTabActive, fetchRequests, pagination.current, pagination.pageSize]);

  const handleResolveRequest = (warrantyId: number) => {
    confirm({
      title: "حل درخواست گارانتی",
      icon: <ExclamationCircleFilled />,
      content:
        'آیا مطمئن هستید که می‌خواهید این درخواست را حل کنید؟ وضعیت گارانتی بر اساس تاریخ انقضا به "فعال" یا "منقضی شده" تغییر خواهد کرد.',
      okText: "بله، حل شود",
      okType: "primary",
      cancelText: "لغو",
      onOk: async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/admin/warranty/requests", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              warrantyId,
              action: "resolve",
            }),
          });

          if (!response.ok) {
            throw new Error("خطا در به‌روزرسانی وضعیت گارانتی");
          }

          // Refresh the list after successful update
          fetchRequests(pagination.current, pagination.pageSize, true);
        } catch (error) {
          console.error("[Client] Error resolving warranty request:", error);
          setLoading(false);
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fa-IR").format(date);
    } catch (error) {
      console.error(error);
      return dateString;
    }
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    fetchRequests(page, pageSize || pagination.pageSize, true);
  };

  const columns = [
    {
      title: "شعبه",
      dataIndex: "branch_name",
      key: "branch_name",
      className: "font-medium",
    },
    {
      title: "محصول",
      dataIndex: "product_name",
      key: "product_name",
      className: "font-medium",
      render: (text: string) => {
        // Display only the product Type field
        return <span className="text-white">{text}</span>;
      },
    },
    {
      title: "کد گارانتی",
      dataIndex: "warrantycode",
      key: "warrantycode",
      className: "font-medium",
      render: (text: string) => <span className="font-mono text-blue-400">{text}</span>,
    },
    {
      title: "مشتری",
      key: "customer",
      className: "font-medium",
      render: (_, record: WarrantyRequest) => (
        <div>
          <div className="mb-1 flex items-center">
            <UserOutlined className="ml-1 text-blue-500" />
            <Text className="text-white">{record.customer_name || "نامشخص"}</Text>
          </div>
          {record.customer_phone && (
            <div className="flex items-center">
              <PhoneOutlined className="ml-1 text-green-500" />
              <a
                href={`tel:${record.customer_phone}`}
                className="text-green-500 transition-colors hover:text-green-400"
              >
                {record.customer_phone}
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "تاریخ شروع",
      dataIndex: "startdate",
      key: "startdate",
      className: "font-medium",
      render: (text: string) => formatDate(text),
    },
    {
      title: "تاریخ انقضا",
      dataIndex: "expirydate",
      key: "expirydate",
      className: "font-medium",
      render: (text: string) => formatDate(text),
    },
    {
      title: "وضعیت",
      key: "status",
      dataIndex: "status",
      className: "font-medium text-center",
      render: () => (
        <Tag color="gold" className="px-3 py-1">
          درخواست بررسی
        </Tag>
      ),
    },
    {
      title: "عملیات",
      key: "actions",
      className: "text-center",
      render: (_, record: WarrantyRequest) => (
        <Button
          type="primary"
          onClick={() => handleResolveRequest(record.warrantyid)}
          icon={<CheckCircleOutlined />}
          className="border-green-600 bg-green-600 hover:bg-green-700"
        >
          حل درخواست
        </Button>
      ),
    },
  ];

  if (!isTabActive && !dataFetched) {
    return null; // Don't render anything if tab is not active and data hasn't been fetched yet
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">درخواست‌های بررسی گارانتی</h2>
        <Button
          onClick={() => fetchRequests(pagination.current, pagination.pageSize, true)}
          icon={<ReloadOutlined />}
          loading={loading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          بروزرسانی
        </Button>
      </div>

      {error ? (
        <Alert
          message="خطا"
          description={
            <div>
              <p>{error}</p>
              <Button
                type="primary"
                onClick={() => fetchRequests(pagination.current, pagination.pageSize, true)}
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
      ) : loading ? (
        <div className="flex items-center justify-center p-8">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      ) : requests.length === 0 ? (
        <Alert
          message="اطلاعات"
          description="هیچ درخواست بررسی گارانتی موجود نیست"
          type="info"
          showIcon
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={requests}
              pagination={false}
              rowKey="warrantyid"
              className="warranty-requests-table"
            />
          </div>

          {pagination.total > pagination.pageSize && (
            <div className="mt-4 flex justify-center">
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePaginationChange}
                className="custom-pagination"
                showSizeChanger
                showQuickJumper
                pageSizeOptions={["10", "20", "50"]}
              />
            </div>
          )}
        </>
      )}

      <style jsx global>{`
        .warranty-requests-table .ant-table {
          background-color: #1f2937;
          color: white;
        }

        .warranty-requests-table .ant-table-thead > tr > th {
          background-color: #263244;
          color: white;
          text-align: center;
          font-weight: 600;
        }

        .warranty-requests-table .ant-table-tbody > tr > td {
          border-color: #374151;
          transition: background 0.2s;
        }

        .warranty-requests-table .ant-table-tbody > tr:nth-child(odd) {
          background-color: #1f2937;
        }

        .warranty-requests-table .ant-table-tbody > tr:nth-child(even) {
          background-color: #263144;
        }

        .warranty-requests-table .ant-table-tbody > tr.ant-table-row:hover > td {
          background-color: #374151;
        }

        .custom-pagination .ant-pagination-item-active {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        .custom-pagination .ant-pagination-item-active a {
          color: white;
        }

        .ant-tag {
          margin: 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
