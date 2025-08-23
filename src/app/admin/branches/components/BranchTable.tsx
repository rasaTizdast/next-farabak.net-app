import {
  DeleteOutlined,
  EditOutlined,
  ShoppingOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm, Empty, Tooltip, Tag, Space, TablePaginationConfig } from "antd";
import React from "react";

import PersianTable from "./PersianTable";
import StatusBadge from "./StatusBadge";
import { Branch, toPersianDate } from "./types";

interface BranchTableProps {
  branches: Branch[];
  loading: boolean;
  onEdit: (branch: Branch) => void;
  onDelete: (branchId: number) => void;
  onViewProducts: (branch: Branch) => void;
  onCreateInvoice: (branch: Branch) => void;
  isSearching: boolean;
  pagination?: TablePaginationConfig;
}

const BranchTable: React.FC<BranchTableProps> = ({
  branches,
  loading,
  onEdit,
  onDelete,
  onViewProducts,
  onCreateInvoice,
  isSearching,
  pagination,
}) => {
  const columns = [
    {
      title: "کد شعبه",
      dataIndex: "location",
      key: "location",
      width: "15%",
      className: "text-right",
    },
    {
      title: "نام شعبه",
      dataIndex: "name",
      key: "name",
      width: "25%",
      className: "text-right",
      render: (name: string, record: Branch) => (
        <div className="flex items-center justify-start">
          {isSearching && record.specificProductQuantity && record.specificProductQuantity > 0 && (
            <Tag color="success" className="ml-2 font-medium">
              موجود
            </Tag>
          )}
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: "تاریخ ایجاد",
      dataIndex: "createdat",
      key: "createdat",
      width: "15%",
      className: "text-right",
      render: (date: string) => <span>{date ? toPersianDate(date) : "تاریخ نامشخص"}</span>,
    },
    {
      title: "محصولات",
      dataIndex: "productCount",
      key: "productCount",
      width: "15%",
      className: "text-right",
      render: (count: number, record: Branch) => (
        <div className="flex flex-col gap-1">
          <StatusBadge productCount={count} totalQuantity={record.totalQuantity} />

          {isSearching && record.specificProductQuantity !== undefined && (
            <div
              className={
                record.specificProductQuantity > 0
                  ? "mt-2 rounded-lg border border-green-700 bg-green-900/30 px-3 py-1.5 text-center transition-all"
                  : "mt-2 rounded-lg border border-gray-700 bg-gray-800/80 px-3 py-1.5 text-center transition-all"
              }
            >
              {record.specificProductQuantity > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-400">تعداد:</span>
                  <span className="rounded bg-green-800/50 px-2 py-0.5 text-sm font-bold text-white">
                    {record.specificProductQuantity} عدد
                  </span>
                </div>
              ) : (
                <div className="text-sm text-gray-400">ناموجود</div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "عملیات",
      key: "actions",
      width: "30%",
      className: "text-center",
      render: (_: any, branch: Branch) => (
        <div className="flex justify-center" style={{ direction: "rtl" }}>
          <Space size="small" wrap className="flex justify-center">
            <Tooltip title="ویرایش اطلاعات شعبه" placement="top">
              <Button
                icon={<EditOutlined />}
                onClick={() => onEdit(branch)}
                type="primary"
                size="middle"
                className="border-blue-700 bg-blue-600 hover:bg-blue-700"
              >
                ویرایش
              </Button>
            </Tooltip>

            <Tooltip title="مدیریت محصولات شعبه" placement="top">
              <Button
                icon={<ShoppingOutlined />}
                onClick={() => onViewProducts(branch)}
                type="default"
                size="middle"
                className={
                  isSearching &&
                  branch.specificProductQuantity &&
                  branch.specificProductQuantity > 0
                    ? "border-green-600 bg-green-700 text-white hover:bg-green-600"
                    : "border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600"
                }
              >
                محصولات
              </Button>
            </Tooltip>

            <Tooltip title="ایجاد فاکتور جدید" placement="top">
              <Button
                icon={<FileTextOutlined />}
                onClick={() => onCreateInvoice(branch)}
                type="default"
                size="middle"
                className="border-green-600 bg-green-700 text-gray-100 hover:bg-green-600"
              >
                فاکتور
              </Button>
            </Tooltip>

            <Tooltip title="حذف شعبه" placement="top">
              <Popconfirm
                title="حذف شعبه"
                description="آیا از حذف این شعبه اطمینان دارید؟"
                onConfirm={() => onDelete(branch.branchid)}
                okText="بله"
                cancelText="خیر"
                okButtonProps={{
                  className: "bg-red-600 hover:bg-red-700 px-5",
                }}
                cancelButtonProps={{
                  className: "px-5",
                }}
                placement="topRight"
              >
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  className="text-red-400 hover:!border-red-700 hover:!bg-red-600 hover:!text-white"
                  style={{
                    transition: "all 0.2s ease",
                  }}
                >
                  حذف
                </Button>
              </Popconfirm>
            </Tooltip>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg bg-gray-800 shadow-md">
      <div className="overflow-x-auto">
        <PersianTable
          columns={columns}
          dataSource={branches}
          rowKey="branchid"
          loading={loading}
          pagination={{
            current: pagination?.current,
            pageSize: pagination?.pageSize || 10,
            total: pagination?.total,
            onChange: pagination?.onChange,
            showSizeChanger: true,
            showQuickJumper: false,
            pageSizeOptions: ["10", "20", "50"],
            position: ["bottomCenter"],
            className: "pagination-dark",
          }}
          scroll={{ x: "max-content" }}
          className="branch-table dark-table rtl-table"
          locale={{
            emptyText: (
              <Empty
                description="هیچ شعبه‌ای یافت نشد"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="text-gray-200"
              />
            ),
          }}
          rowClassName={(record) => {
            if (isSearching && record.specificProductQuantity !== undefined) {
              return record.specificProductQuantity > 0
                ? "searched-product-found-row"
                : "searched-product-not-found-row";
            }
            return "";
          }}
          direction="rtl"
        />
      </div>
    </div>
  );
};

export default BranchTable;
