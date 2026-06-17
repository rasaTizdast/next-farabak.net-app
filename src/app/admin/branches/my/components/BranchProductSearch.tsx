"use client";

import { SearchOutlined, ShopOutlined } from "@ant-design/icons";
import { Button, Table, Empty, Spin, message, Select, Card, Alert, Tag } from "antd";
import { useState } from "react";

import { useApiFetch } from "@/hooks/useApiFetch";
import { Product } from "../../components/types";

interface BranchProduct {
  branchid: number;
  branchName: string;
  location?: string;
  ProductId: number;
  ProductType: string;
  quantity: number;
}

interface BranchProductSearchProps {
  isTabActive: boolean;
}

interface ProductsResponse {
  data?: Product[];
}

const BranchProductSearch: React.FC<BranchProductSearchProps> = ({ isTabActive }) => {
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [branchProducts, setBranchProducts] = useState<BranchProduct[]>([]);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  const { data: productsData, loading: productsLoading } = useApiFetch<ProductsResponse>(
    isTabActive ? "/api/admin/products/all" : null
  );
  const products: Product[] = productsData?.data || [];

  async function doBranchProductSearch(
    selectedProduct: number,
    setSearchLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setSearchPerformed: React.Dispatch<React.SetStateAction<boolean>>,
    setBranchProducts: React.Dispatch<React.SetStateAction<BranchProduct[]>>,
    products: Product[]
  ) {
    try {
      setSearchLoading(true);
      setSearchPerformed(true);

      const response = await fetch(
        `/api/admin/branches/product-stock?productId=${selectedProduct}`
      );
      if (!response.ok) {
        throw new Error("Failed to search branches");
      }

      const data = await response.json();
      let processedData: BranchProduct[] = [];

      if (Array.isArray(data)) {
        processedData = data
          .filter((branch) => branch && branch.branchid && branch.name)
          .map((branch) => ({
            branchid: branch.branchid,
            branchName: branch.name,
            location: branch.location,
            ProductId: selectedProduct,
            ProductType: products.find((p) => p.ProductId === selectedProduct)?.Type || "",
            quantity: branch.quantity || 0,
          }));
      } else if (data && Array.isArray(data.branches)) {
        processedData = data.branches.filter((branch) => branch && branch.branchid);
      }

      setBranchProducts(processedData);
    } catch (error) {
      console.error("Error searching branches:", error);
      message.error("خطا در جستجوی شعبه‌ها");
      setBranchProducts([]);
    } finally {
      setSearchLoading(false);
    }
  }

  const handleSearch = async () => {
    if (!selectedProduct) {
      message.warning("لطفا یک محصول انتخاب کنید");
      return;
    }

    await doBranchProductSearch(selectedProduct, setSearchLoading, setSearchPerformed, setBranchProducts, products);
  };

  // More compact columns for side-by-side layout
  const columns = [
    {
      title: "نام شعبه",
      dataIndex: "branchName",
      key: "branchName",
      width: "65%",
      render: (text: string) => <span className="font-medium text-blue-400">{text}</span>,
    },
    {
      title: "موجودی",
      dataIndex: "quantity",
      key: "quantity",
      width: "35%",
      render: (quantity: number) => (
        <Tag
          color={quantity > 10 ? "success" : quantity > 0 ? "blue-inverse" : "error"}
          className="px-2 py-0.5 text-center"
        >
          {quantity} عدد
        </Tag>
      ),
    },
  ];

  return (
    <div className="branch-product-search">
      <Card
        title="جستجوی محصول در شعبه‌های دیگر"
        className="h-full border-0 bg-gray-800"
        headStyle={{
          backgroundColor: "#19202b",
          color: "white",
          borderBottom: "1px solid #374151",
        }}
        bodyStyle={{
          backgroundColor: "#19202b",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="mb-4">
          <Alert
            message="جستجوی موجودی محصولات در سایر شعبه‌ها"
            description="محصول مورد نظر خود را انتخاب کنید تا شعبه‌های دارای آن محصول را مشاهده نمایید."
            type="info"
            showIcon
            className="mb-4"
          />
        </div>

        <div className="mb-4 flex flex-col gap-3">
          <div>
            <label className="mb-2 block text-gray-300">انتخاب محصول</label>
            <Select
              showSearch
              placeholder="محصول مورد نظر را انتخاب کنید"
              optionFilterProp="children"
              onChange={(value) => setSelectedProduct(value)}
              value={selectedProduct}
              loading={productsLoading}
              className="w-full border-gray-600 bg-gray-700 text-white"
              popupClassName="custom-dropdown enhanced-dropdown"
              filterOption={(input, option) =>
                (option?.label?.toString() || "").toLowerCase().includes(input.toLowerCase())
              }
              options={products.map((product) => ({
                value: product.ProductId,
                label: product.Type,
              }))}
            />
          </div>

          <div className="mt-2">
            <Button
              type="primary"
              onClick={handleSearch}
              loading={searchLoading}
              icon={<SearchOutlined />}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              جستجو در شعبه‌ها
            </Button>
          </div>
        </div>

        {/* Results section */}
        {searchPerformed && (
          <div className="mt-2 flex-grow overflow-auto">
            <div className="mb-3 border-t border-gray-600 pt-4">
              <div className="mb-3 flex items-center">
                <ShopOutlined className="ml-2 text-blue-400" />
                <span className="text-lg font-medium text-gray-200">نتایج جستجو</span>
                {selectedProduct && (
                  <Tag color="blue" className="mr-3">
                    {products.find((p) => p.ProductId === selectedProduct)?.Type}
                  </Tag>
                )}
              </div>
            </div>

            {searchLoading ? (
              <div className="flex items-center justify-center p-6">
                <Spin size="large" tip="در حال جستجو..." />
              </div>
            ) : branchProducts.length > 0 ? (
              <div>
                <Table
                  dataSource={branchProducts}
                  columns={columns}
                  rowKey="branchid"
                  pagination={{ pageSize: 5, size: "small" }}
                  className="branch-result-table enhanced-table rtl-table"
                  size="small"
                  scroll={{ x: 500 }}
                />
                <Alert
                  message="اقدام بعدی"
                  description="برای درخواست انتقال محصول از شعبه دیگر، لطفا با مدیر سیستم تماس بگیرید."
                  type="warning"
                  showIcon
                  className="mt-4"
                />
              </div>
            ) : (
              <Empty
                description="هیچ شعبه‌ای با این محصول یافت نشد"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="p-6 text-gray-300"
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BranchProductSearch;
