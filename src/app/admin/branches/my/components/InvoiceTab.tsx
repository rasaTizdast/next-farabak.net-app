"use client";

import moment from "jalali-moment";
import {
  Card,
  Empty,
  Spin,
  Button,
  Table,
  Tag,
  Input,
  AutoComplete,
} from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { AdminInvoice } from "@/app/admin/invoices/type";

function formatPersianDate(date: string) {
  try {
    return moment(date).locale("fa").format("jYYYY/jMM/jDD");
  } catch (e) {
    console.error(e);
    return date || "-";
  }
}

interface InvoiceTabProps {
  invoices: AdminInvoice[];
  invoicesLoading: boolean;
  invoicePagination: { current: number; pageSize: number; total: number };
  searchText: string;
  searchOptions: { value: string; label: React.ReactNode }[];
  filteredInvoices: AdminInvoice[];
  filteredStandaloneWarranties: any[];
  warrantySummary: { active: number; expired: number };
  memoizedInvoiceColumns: any[];
  branchName?: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onCreateInvoice: () => void;
  onInvoicePageChange: (page: number, pageSize: number) => void;
  onViewInvoice: (invoice: AdminInvoice) => void;
  onViewWarranty: (warranty: any, branchName?: string) => void;
}

export default function InvoiceTab({
  invoices,
  invoicesLoading,
  invoicePagination,
  searchText,
  searchOptions,
  filteredInvoices,
  filteredStandaloneWarranties,
  warrantySummary,
  memoizedInvoiceColumns,
  branchName,
  onSearchChange,
  onRefresh,
  onCreateInvoice,
  onInvoicePageChange,
  onViewInvoice,
  onViewWarranty,
}: InvoiceTabProps) {
  const standaloneColumns = [
    {
      title: "کد گارانتی",
      dataIndex: "warrantycode",
      key: "warrantycode",
      className: "text-right font-medium",
      render: (text: string) => (
        <span className="font-medium text-orange-400">{text}</span>
      ),
    },
    {
      title: "نام مشتری",
      dataIndex: "clientFullName",
      key: "clientFullName",
      className: "text-right font-medium",
      render: (text: string) => (
        <span className="font-medium text-green-400">
          {text || "نامشخص"}
        </span>
      ),
    },
    {
      title: "شماره تماس",
      dataIndex: "ClientPhoneNumber",
      key: "ClientPhoneNumber",
      className: "text-right font-medium",
      render: (phone: string) =>
        phone ? (
          <a
            href={`tel:${phone}`}
            className="text-blue-400 transition-colors hover:text-blue-300"
          >
            {phone}
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: "نوع محصول",
      dataIndex: "Type",
      key: "Type",
      className: "text-right font-medium",
      render: (text: string) => (
        <span className="text-gray-100">{text}</span>
      ),
    },
    {
      title: "تاریخ شروع",
      dataIndex: "startdate",
      key: "startdate",
      className: "text-right font-medium",
      render: (date: string) => (
        <span className="text-gray-200">
          {formatPersianDate(date)}
        </span>
      ),
    },
    {
      title: "تاریخ انقضا",
      dataIndex: "expirydate",
      key: "expirydate",
      className: "text-right font-medium",
      render: (date: string) => (
        <span className="text-gray-200">
          {formatPersianDate(date)}
        </span>
      ),
    },
    {
      title: "وضعیت",
      dataIndex: "displayStatus",
      key: "displayStatus",
      className: "text-center font-medium",
      render: (status: string) => (
        <Tag
          color={status === "Expired" ? "error" : "success"}
          className="flex min-w-[120px] items-center justify-center px-4 py-1.5"
          style={{
            fontFamily: "inherit",
            fontWeight: 500,
          }}
        >
          {status === "Expired" ? "منقضی شده" : "فعال"}
        </Tag>
      ),
    },
    {
      title: "عملیات",
      key: "actions",
      className: "text-center font-medium",
      render: (_: any, warranty: any) => (
        <Button
          htmlType="button"
          type="primary"
          className="flex items-center border-blue-700 bg-blue-600 hover:bg-blue-700"
          onClick={() => onViewWarranty(warranty, branchName)}
        >
          <span>مشاهده جزئیات</span>
          <EyeOutlined className="mr-2" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card
        className="mb-4 border-0 bg-gray-800 shadow-md"
        headStyle={{
          backgroundColor: "#1f2937",
          borderBottom: "1px solid #374151",
          padding: "16px 20px",
          fontFamily: "inherit",
        }}
        bodyStyle={{
          backgroundColor: "#1f2937",
          padding: "16px 20px",
          fontFamily: "inherit",
        }}
        title={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 text-lg font-medium text-white">
              فاکتورها و گارانتی‌های شعبه
            </h2>
            <div className="flex items-center gap-2">
              <Button
                htmlType="button"
                onClick={onRefresh}
                className="flex items-center border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                loading={invoicesLoading}
                icon={<ReloadOutlined />}
              >
                به‌روزرسانی
              </Button>
              <Button
                htmlType="button"
                type="primary"
                onClick={onCreateInvoice}
                className="flex items-center bg-green-600 hover:bg-green-700"
              >
                <span>ثبت فاکتور جدید</span>
                <PlusOutlined className="mr-2" />
              </Button>
            </div>
          </div>
        }
      >
        <div className="relative">
          <AutoComplete
            placeholder="جستجوی شماره فاکتور، نام مشتری، شماره تماس یا کد گارانتی..."
            popupMatchSelectWidth={500}
            style={{ width: "100%" }}
            options={searchOptions}
            value={searchText}
            onChange={onSearchChange}
            onSelect={(value) => onSearchChange(value)}
            listHeight={400}
            listItemHeight={38}
            showSearch
            filterOption={false}
            popupClassName="enhanced-dropdown"
          >
            <Input
              suffix={<SearchOutlined className="text-blue-400" />}
              style={{
                backgroundColor: "#54647c",
                color: "white",
                borderColor: "#4b5563",
                padding: "10px 12px",
                height: "42px",
                fontSize: "15px",
                textAlign: "right",
              }}
            />
          </AutoComplete>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card
          className="border-0 bg-gray-800 shadow-md transition-shadow hover:shadow-lg"
          bodyStyle={{
            padding: "16px 20px",
            fontFamily: "inherit",
            backgroundColor: "#1f2937",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-200">گارانتی‌های فعال:</span>
            <Tag
              color="success"
              className="flex min-w-[50px] items-center justify-center px-4 py-1.5 text-base"
              style={{ fontFamily: "inherit" }}
            >
              {warrantySummary.active}
            </Tag>
          </div>
        </Card>
        <Card
          className="border-0 bg-gray-800 shadow-md transition-shadow hover:shadow-lg"
          bodyStyle={{
            padding: "16px 20px",
            fontFamily: "inherit",
            backgroundColor: "#1f2937",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-200">گارانتی‌های منقضی شده:</span>
            <Tag
              color="error"
              className="flex min-w-[50px] items-center justify-center px-4 py-1.5 text-base"
              style={{ fontFamily: "inherit" }}
            >
              {warrantySummary.expired}
            </Tag>
          </div>
        </Card>
      </div>

      <Card
        className="mb-6 overflow-hidden rounded-lg border-0 bg-gray-800 shadow-md"
        bodyStyle={{
          padding: "0",
          fontFamily: "inherit",
          backgroundColor: "#1f2937",
        }}
        title={
          <div className="flex items-center px-4 py-2">
            <h3 className="m-0 text-lg font-medium text-white">فاکتورها</h3>
          </div>
        }
        headStyle={{
          backgroundColor: "#1f2937",
          borderBottom: "1px solid #374151",
          color: "#f3f4f6",
          padding: "12px 0",
        }}
      >
        {invoicesLoading ? (
          <div className="flex items-center justify-center p-10">
            <Spin size="large" tip="در حال بارگذاری..." />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <Empty
            description="هیچ فاکتوری یافت نشد"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="p-8 text-gray-300"
          />
        ) : (
          <Table
            columns={memoizedInvoiceColumns}
            dataSource={filteredInvoices}
            rowKey="Invoiceid"
            pagination={{
              current: invoicePagination.current,
              pageSize: invoicePagination.pageSize,
              total: invoicePagination.total,
              onChange: (page, pageSize) => {
                onInvoicePageChange(page, pageSize || invoicePagination.pageSize);
              },
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["10", "20", "50"],
              position: ["bottomCenter"],
              className: "pagination-dark",
            }}
            scroll={{ x: "max-content" }}
            className="branch-invoices-table enhanced-table rtl-table"
            rowClassName={(record: AdminInvoice) => (!record.Checked ? "unread-invoice-row" : "")}
          />
        )}
      </Card>

      {filteredStandaloneWarranties.length > 0 && (
        <>
          <hr className="mt-4" />
          <Card
            className="overflow-hidden rounded-lg border-0 bg-gray-800 shadow-md"
            bodyStyle={{
              padding: "0",
              fontFamily: "inherit",
              backgroundColor: "#1f2937",
            }}
            title={
              <div className="flex items-center px-4 py-2">
                <h3 className="m-0 text-lg font-medium text-white">گارانتی‌های مستقل</h3>
                <Tag color="blue" className="mr-2">
                  {filteredStandaloneWarranties.length} گارانتی
                </Tag>
              </div>
            }
            headStyle={{
              backgroundColor: "#1f2937",
              borderBottom: "1px solid #374151",
              color: "#f3f4f6",
              padding: "12px 0",
            }}
          >
            {invoicesLoading ? (
              <div className="flex items-center justify-center p-10">
                <Spin size="large" tip="در حال بارگذاری..." />
              </div>
            ) : (
              <Table
                columns={standaloneColumns}
                dataSource={filteredStandaloneWarranties}
                rowKey="warrantyid"
                pagination={{
                  pageSize: 5,
                  hideOnSinglePage: true,
                  position: ["bottomCenter"],
                  className: "pagination-dark",
                }}
                scroll={{ x: "max-content" }}
                className="standalone-warranties-table enhanced-table rtl-table"
              />
            )}
          </Card>
        </>
      )}
    </>
  );
}