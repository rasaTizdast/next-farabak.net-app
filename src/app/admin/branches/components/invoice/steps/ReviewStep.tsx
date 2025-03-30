"use client";

import React from "react";
import { Card, Descriptions, Table, Divider, Alert } from "antd";
import { Invoice } from "../../types";

interface ReviewStepProps {
  invoice: Invoice;
  selectedProducts: any[];
  productsWithWarranty: any[];
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  invoice,
  selectedProducts,
  productsWithWarranty,
}) => {
  // Check if all products have valid warranty settings
  const hasInvalidWarranty = productsWithWarranty.some(
    (product) =>
      product.warranty.hasWarranty &&
      (!product.warranty.startdate || !product.warranty.expirydate)
  );

  const columns = [
    {
      title: "نام محصول",
      dataIndex: "Name",
      key: "name",
    },
    {
      title: "تعداد",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "قیمت واحد (تومان)",
      key: "price",
      render: (text: any, record: any) =>
        new Intl.NumberFormat("fa-IR").format(Math.round(record.price / 10)),
    },
    {
      title: "قیمت کل (تومان)",
      key: "total_price",
      render: (text: any, record: any) =>
        new Intl.NumberFormat("fa-IR").format(
          Math.round(record.total_price / 10)
        ),
    },
    {
      title: "گارانتی",
      key: "warranty",
      render: (text: any, record: any) => {
        const productWithWarranty = productsWithWarranty.find(
          (p) => p.ProductId === record.ProductId
        );

        if (
          !productWithWarranty ||
          productWithWarranty.warranty.hasWarranty === false
        ) {
          return "بدون گارانتی";
        }

        return productWithWarranty.warranty.warrantycode;
      },
    },
  ];

  return (
    <Card className="bg-gray-900 border-0 shadow-md">
      <h3 className="text-lg font-medium text-white mb-4">بررسی نهایی فاکتور</h3>

      {hasInvalidWarranty && (
        <Alert
          message="خطا در تنظیمات گارانتی"
          description="برخی از محصولات دارای تنظیمات گارانتی ناقص هستند. لطفا به مرحله قبل بازگردید و تنظیمات را کامل کنید."
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Descriptions
        title={<span className="text-white">اطلاعات خریدار</span>}
        bordered
        column={1}
        className="mb-4 custom-dark-descriptions"
        labelStyle={{ color: '#d1d5db', backgroundColor: '#1f2937' }}
        contentStyle={{ color: 'white', backgroundColor: '#111827' }}
      >
        <Descriptions.Item label="نام و نام خانوادگی">
          {invoice.Fullname}
        </Descriptions.Item>
        <Descriptions.Item label="شماره تماس">
          {invoice.Phonenumber}
        </Descriptions.Item>
      </Descriptions>

      <Divider className="bg-gray-700" />

      <h4 className="text-white mb-4">محصولات</h4>
      <Table
        dataSource={selectedProducts}
        columns={columns}
        rowKey="ProductId"
        pagination={false}
        className="custom-dark-table"
        scroll={{ x: "max-content" }}
        rowClassName="dark-table-row"
        footer={() => (
          <div className="text-right">
            <span className="text-lg font-bold text-white">
              مجموع کل:{" "}
              {new Intl.NumberFormat("fa-IR").format(
                Math.round(invoice.TotalAmount / 10)
              )}{" "}
              تومان
            </span>
          </div>
        )}
      />

      <Divider className="bg-gray-700" />

      <div className="text-white text-right mt-4">
        <p>
          با ثبت فاکتور، این اطلاعات ذخیره شده و قابل مشاهده در بخش فاکتورها
          خواهد بود.
        </p>
      </div>

      <style jsx global>{`
        .custom-dark-descriptions .ant-descriptions-header {
          color: white;
        }
        
        .custom-dark-descriptions .ant-descriptions-title {
          color: white;
        }
        
        .custom-dark-descriptions .ant-descriptions-view {
          border-color: #374151;
        }
        
        .custom-dark-descriptions th.ant-descriptions-item-label,
        .custom-dark-descriptions td.ant-descriptions-item-content {
          border-color: #374151;
        }
        
        .custom-dark-table .ant-table {
          background-color: #111827;
          color: white;
        }
        
        .custom-dark-table .ant-table-thead > tr > th {
          background-color: #1f2937;
          color: white;
          border-bottom: 1px solid #374151;
        }
        
        .custom-dark-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #374151;
          color: white;
        }
        
        .custom-dark-table .ant-table-tbody > tr.dark-table-row:hover > td {
          background-color: #2d3748;
        }
        
        .dark-table-row {
          background-color: #111827;
        }
        
        .custom-dark-table .ant-table-container {
          border: 1px solid #374151;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .custom-dark-table .ant-table-footer {
          background-color: #1f2937;
          color: white;
          border-top: 1px solid #374151;
        }
      `}</style>
    </Card>
  );
};

export default ReviewStep;