"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Spin,
  Alert,
  Tag,
  Typography,
  Pagination,
  Modal,
  Button,
  Space,
} from "antd";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ExclamationCircleFilled } from "@ant-design/icons";

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
  const [dataFetched, setDataFetched] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchRequests = async (page: number = 1, pageSize: number = 10) => {
    if (!isTabActive && dataFetched) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/warranty/requests?page=${page}&limit=${pageSize}`
      );

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
    } catch (err: any) {
      setError(err.message || "خطا در دریافت درخواست‌های گارانتی");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the tab becomes active
  useEffect(() => {
    if (isTabActive && !dataFetched) {
      fetchRequests();
    }
  }, [isTabActive]);

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
        } catch (error) {
          console.error("Error resolving warranty request:", error);
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fa-IR").format(date);
    } catch (error) {
      return dateString;
    }
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
      render: (text: string) => (
        <span className="font-mono text-blue-400">{text}</span>
      ),
    },
    {
      title: "مشتری",
      key: "customer",
      className: "font-medium",
      render: (_, record: WarrantyRequest) => (
        <div>
          <div className="flex items-center mb-1">
            <UserOutlined className="ml-1 text-blue-500" />
            <Text className="text-white">
              {record.customer_name || "نامشخص"}
            </Text>
          </div>
          {record.customer_phone && (
            <div className="flex items-center">
              <PhoneOutlined className="ml-1 text-green-500" />
              <a
                href={`tel:${record.customer_phone}`}
                className="text-green-500 hover:text-green-400 transition-colors"
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
          className="bg-green-600 hover:bg-green-700 border-green-600"
        >
          حل درخواست
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  if (error) {
    return <Alert message="خطا" description={error} type="error" showIcon />;
  }

  if (!isTabActive && !dataFetched) {
    return null; // Don't render anything if tab is not active and data hasn't been fetched yet
  }

  if (requests.length === 0 && dataFetched) {
    return (
      <Alert
        message="اطلاعات"
        description="هیچ درخواست بررسی گارانتی موجود نیست"
        type="info"
        showIcon
      />
    );
  }

  return (
    <div className="space-y-4 bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-xl warranty-requests-wrapper">
      <Title level={4} className="!text-white !mb-7">
        درخواست‌های بررسی گارانتی
      </Title>

      <Table
        columns={columns}
        dataSource={requests.map((item) => ({ ...item, key: item.warrantyid }))}
        pagination={false}
        bordered={false}
        className="rtl-table warranty-requests-table"
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          direction: "rtl",
        }}
      />

      {pagination.total > pagination.pageSize && (
        <div className="flex justify-center mt-6">
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
          background-color: transparent !important;
          color: #e2e8f0 !important;
        }

        .warranty-requests-table .ant-table-container {
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #334155;
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

        .warranty-requests-table
          .ant-table-tbody
          > tr:hover:nth-child(even)
          > td {
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
        .ant-btn {
          font-family: inherit !important;
        }

        .ant-modal-content,
        .ant-modal-header,
        .ant-modal-title,
        .ant-modal-body {
          font-family: inherit !important;
        }
      `}</style>
    </div>
  );
}
