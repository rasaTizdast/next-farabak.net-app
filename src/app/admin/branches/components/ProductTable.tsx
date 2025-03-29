import React from 'react';
import { Table, Button, Popconfirm, InputNumber, Empty, Spin } from 'antd';
import { DeleteOutlined } from "@ant-design/icons";
import { Product } from './types';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  onUpdateQuantity,
  onRemove
}) => {
  const columns = [
    {
      title: "نام محصول",
      dataIndex: "Type",
      key: "Type",
      width: "60%",
    },
    {
      title: "تعداد",
      dataIndex: "quantity",
      key: "quantity",
      width: "20%",
      render: (quantity: number, record: Product) => (
        <InputNumber
          min={0}
          defaultValue={quantity}
          onChange={(value) => {
            if (value !== null) {
              onUpdateQuantity(record.ProductId, value);
            }
          }}
          className="w-20 dark-input-number"
          style={{
            backgroundColor: "#374151",
            borderColor: "#4b5563",
            color: "#e5e7eb",
          }}
        />
      ),
    },
    {
      title: "عملیات",
      key: "actions",
      width: "20%",
      render: (_: any, product: Product) => (
        <Popconfirm
          title="حذف محصول"
          description="آیا از حذف این محصول از شعبه اطمینان دارید؟"
          onConfirm={() => onRemove(product.ProductId)}
          okText="بله"
          cancelText="خیر"
          okButtonProps={{ className: "bg-red-600 hover:bg-red-700" }}
        >
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            className="!bg-red-500 !text-white !border-none hover:!bg-red-600"
          >
            حذف
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <Spin />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <Table
        columns={columns}
        dataSource={products}
        rowKey="ProductId"
        pagination={false}
        className="dark-table"
        locale={{
          emptyText: (
            <Empty
              description="هیچ محصولی برای این شعبه یافت نشد"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="text-gray-400"
            />
          ),
        }}
      />
    </div>
  );
};

export default ProductTable; 