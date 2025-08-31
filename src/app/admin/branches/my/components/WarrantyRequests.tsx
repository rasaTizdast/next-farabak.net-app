"use client";

import {
  LoadingOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  UserOutlined,
  ReloadOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { Table, Spin, Alert, Tag, Typography, Pagination, Modal, Button, Empty } from "antd";
import { useState, useEffect, useCallback } from "react";

const { Title, Text } = Typography;
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [dataFetched, setDataFetched] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [resolveLoading, setResolveLoading] = useState<number | null>(null);

  const fetchRequests = useCallback(
    async (page: number = 1, pageSize: number = 10, retry: boolean = false) => {
      if (!isTabActive && dataFetched) return;

      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `/api/admin/branches/my/requests?page=${page}&limit=${pageSize}`,
          {
            cache: "no-cache",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`خطا در دریافت درخواست‌ها: ${response.status}`);
        }

        const data = await response.json();
        // Make sure we have an array of requests
        const requestsData = Array.isArray(data.requests) ? data.requests : [];
        setRequests(requestsData);

        // Set pagination with safe defaults
        setPagination({
          current: data.pagination?.currentPage || page,
          pageSize: data.pagination?.pageSize || pageSize,
          total: data.pagination?.totalCount || requestsData.length,
          totalPages: data.pagination?.totalPages || Math.ceil(requestsData.length / pageSize),
        });

        setDataFetched(true);
      } catch (err: any) {
        console.error("Error fetching warranty requests:", err);
        setError(err.message || "خطا در دریافت درخواست‌های گارانتی");

        // If this is the first error, retry once automatically
        if (!retry && retryCount < 2) {
          setRetryCount((prev) => prev + 1);
          setTimeout(() => fetchRequests(page, pageSize, true), 2000);
        }
      } finally {
        setLoading(false);
      }
    },
    [isTabActive, dataFetched, retryCount]
  );

  // Initial fetch
  useEffect(() => {
    if (isTabActive && !dataFetched) {
      fetchRequests();
    }
  }, [isTabActive, dataFetched, fetchRequests]);

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
          setResolveLoading(warrantyId);
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
          fetchRequests(pagination.current, pagination.pageSize);
        } catch (error: any) {
          console.error("Error resolving warranty request:", error);
          Modal.error({
            title: "خطا در بروزرسانی وضعیت",
            content: error.message || "خطایی در بروزرسانی وضعیت گارانتی رخ داد",
          });
        } finally {
          setResolveLoading(null);
        }
      },
    });
  };

  const handleRetry = () => {
    setDataFetched(false);
    fetchRequests(pagination.current, pagination.pageSize);
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

  if (requests.length === 0) {
    return (
      <Empty
        description="هیچ درخواست بررسی گارانتی موجود نیست"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="p-8"
      />
    );
  }

  const columns = [
    {
      title: "محصول",
      dataIndex: "product_name",
      key: "product_name",
      className: "font-medium",
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
            <Text>{record.customer_name || "نامشخص"}</Text>
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
          loading={resolveLoading === record.warrantyid}
        >
          حل درخواست
        </Button>
      ),
    },
  ];

  return (
    <div className="warranty-requests-wrapper space-y-4 rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <Title level={4} className="mb-0 text-white">
          درخواست‌های بررسی گارانتی شعبه شما
        </Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRetry}
          className="border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
        >
          بروزرسانی
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={requests.map((item) => ({ ...item, key: item.warrantyid }))}
        pagination={false}
        bordered
        className="rtl-table warranty-requests-table"
        style={{
          backgroundColor: "#1a1f2e",
          borderRadius: "8px",
          overflow: "hidden",
          direction: "rtl",
        }}
      />

      {pagination.total > pagination.pageSize && (
        <div className="mt-6 flex justify-center">
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={(page, pageSize) => fetchRequests(page, pageSize || 10)}
            className="warranty-pagination"
          />
        </div>
      )}

      <style jsx global>{`
        .warranty-requests-wrapper {
          font-family: inherit !important;
        }

        .warranty-requests-wrapper * {
          font-family: inherit !important;
        }

        .warranty-requests-table .ant-table {
          background-color: #1a1f2e !important;
          color: #e2e8f0 !important;
        }

        .warranty-requests-table .ant-table-thead > tr > th {
          background-color: #222b3f !important;
          color: #f8fafc !important;
          border-color: #334155 !important;
          text-align: right !important;
          font-weight: 600 !important;
        }

        .warranty-requests-table .ant-table-tbody > tr > td {
          background-color: #1a1f2e !important;
          color: #e2e8f0 !important;
          border-color: #334155 !important;
          text-align: right !important;
        }

        .warranty-requests-table .ant-table-tbody > tr:hover > td {
          background-color: #2a364a !important;
        }

        .warranty-requests-table .ant-table-tbody > tr:nth-child(even) > td {
          background-color: #1e263a !important;
        }

        .warranty-requests-table .ant-table-tbody > tr:hover:nth-child(even) > td {
          background-color: #2a364a !important;
        }

        .warranty-pagination .ant-pagination-item {
          background-color: #1a1f2e !important;
          border-color: #334155 !important;
        }

        .warranty-pagination .ant-pagination-item a {
          color: #e2e8f0 !important;
        }

        .warranty-pagination .ant-pagination-item-active {
          background-color: #1d4ed8 !important;
          border-color: #1d4ed8 !important;
        }

        .warranty-pagination .ant-pagination-item-active a {
          color: white !important;
        }

        .warranty-pagination .ant-pagination-prev button,
        .warranty-pagination .ant-pagination-next button {
          color: #e2e8f0 !important;
          background-color: #1a1f2e !important;
          border-color: #334155 !important;
        }

        .warranty-pagination .ant-pagination-disabled button {
          color: #64748b !important;
        }

        /* Fix font-family issues */
        .ant-table,
        .ant-table-thead,
        .ant-table-tbody,
        .ant-table-cell,
        .ant-tag,
        .ant-typography,
        .ant-pagination,
        .ant-btn,
        .ant-modal,
        .ant-modal-content {
          font-family: inherit !important;
        }
      `}</style>
    </div>
  );
}
