"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Card, Empty, Spin, Button, Table } from "antd";

import { adminColors } from "@/constants/adminColors";

import BranchProductSearch from "./BranchProductSearch";
import { Product, ProductColumn } from "../../components/types";

interface ProductTabProps {
  products: Product[];
  productsLoading: boolean;
  productPagination: { current: number; pageSize: number; total: number };
  productColumns: ProductColumn[];
  branch: { branchid: number } | null;
  onAddProduct: () => void;
  onPageChange: (page: number, pageSize: number) => void;
}

export default function ProductTab({
  products,
  productsLoading,
  productPagination,
  productColumns,
  onAddProduct,
  onPageChange,
}: ProductTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">محصولات شعبه</span>
            <Button
              htmlType="button"
              type="primary"
              onClick={onAddProduct}
              className="flex items-center justify-center border-blue-700 bg-blue-600 hover:bg-blue-700"
            >
              <span>افزودن محصول</span>
              <PlusOutlined className="mr-2" />
            </Button>
          </div>
        }
        className="overflow-hidden rounded-lg border-0 bg-gray-800 text-white"
        headStyle={{
          backgroundColor: adminColors.panelAlt,
          borderBottom: `1px solid ${adminColors.border}`,
          color: adminColors.textBright,
          padding: "16px 20px",
          fontFamily: "inherit",
        }}
        bodyStyle={{
          backgroundColor: adminColors.panelAlt,
          padding: "16px 20px",
          fontFamily: "inherit",
        }}
      >
        {productsLoading ? (
          <div className="my-8 flex justify-center">
            <Spin />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              columns={productColumns}
              dataSource={products}
              rowKey="ProductId"
              pagination={{
                current: productPagination.current,
                pageSize: productPagination.pageSize,
                total: productPagination.total,
                onChange: (page, pageSize) => {
                  onPageChange(page, pageSize || productPagination.pageSize);
                },
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["10", "20", "50"],
                position: ["bottomCenter"],
                className: "pagination-dark [&_.ant-pagination-options-quick-jumper]:!hidden",
              }}
              className="dark-table enhanced-table rtl-table [&_.ant-pagination-next]:rotate-180 [&_.ant-pagination-prev]:rotate-180 [&_.ant-table-pagination]:my-4!"
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
        )}
      </Card>
      <BranchProductSearch isTabActive={true} />
    </div>
  );
}
