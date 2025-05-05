import React, { useEffect } from "react";
import { Card, Tag, Typography, Alert } from "antd";
import {
  SearchOutlined,
  ProjectOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Branch } from "./types";

const { Title, Text } = Typography;

interface ProductSearchSummaryProps {
  productName: string;
  productId: number;
  branches: Branch[];
  clearSearch: () => void;
  totalBranchCount?: number;
}

const ProductSearchSummary: React.FC<ProductSearchSummaryProps> = ({
  productName,
  productId,
  branches,
  clearSearch,
  totalBranchCount = 0,
}) => {
  // Calculate total quantity across all branches
  const totalQuantity = branches.reduce((sum, branch) => {
    return sum + (branch.specificProductQuantity || 0);
  }, 0);

  // Count branches with this product
  const branchesWithProduct = branches.filter(
    (branch) => (branch.specificProductQuantity || 0) > 0
  ).length;

  // Calculate branches without this product
  const branchesWithoutProduct = totalBranchCount - branchesWithProduct;

  // Debug logging
  useEffect(() => {
    console.log("Total branches count:", totalBranchCount);
    console.log("Branches with product:", branchesWithProduct);
    console.log("Branches without product:", branchesWithoutProduct);
    console.log(
      "Branch quantities:",
      branches.map((b) => ({
        name: b.name,
        qty: b.specificProductQuantity,
        hasProduct: (b.specificProductQuantity || 0) > 0,
      }))
    );
  }, [branches, branchesWithProduct, branchesWithoutProduct, totalBranchCount]);

  return (
    <Card
      className="bg-gray-800 mb-6 rounded-lg shadow-lg overflow-hidden border-0"
      bodyStyle={{
        backgroundColor: "#19202b",
        padding: "16px 20px",
        borderTop: "1px solid #334155",
        direction: "rtl",
      }}
    >
      <div className="flex flex-col space-y-4" style={{ direction: "rtl" }}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div className="flex items-center mb-2 sm:mb-0">
            <SearchOutlined className="text-blue-400 ml-2 text-xl" />
            <Title level={4} className="!text-white !m-0 !font-bold">
              نتایج جستجو
            </Title>
          </div>
          <Tag
            color="blue"
            className="cursor-pointer text-sm font-medium px-3 py-1.5 self-start sm:self-auto"
            onClick={clearSearch}
          >
            پاک کردن جستجو
          </Tag>
        </div>

        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4">
          <div className="flex items-center flex-wrap">
            <ProjectOutlined className="text-blue-400 ml-2" />
            <Text className="!text-gray-300 ml-1">محصول:</Text>
            <Text strong className="!text-white ml-2">
              {productName}
            </Text>
            <Tag className="bg-blue-900/50 border-blue-800 text-blue-300 mr-0 ml-2">
              کد: {productId}
            </Tag>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/50">
              <div className="font-bold text-xl text-blue-400 mb-1 text-center">
                {totalQuantity}
              </div>
              <div className="text-sm text-gray-300 text-center">
                تعداد کل موجود در همه شعبه‌ها
              </div>
            </div>

            <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-900/50">
              <div className="font-bold text-xl text-indigo-400 mb-1 text-center">
                {branchesWithProduct}
              </div>
              <div className="text-sm text-gray-300 text-center">
                شعبه‌های دارای این محصول
              </div>
            </div>

            <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-900/50">
              <div className="font-bold text-xl text-purple-400 mb-1 text-center">
                {branchesWithoutProduct}
              </div>
              <div className="text-sm text-gray-300 text-center">
                شعبه‌های بدون این محصول
              </div>
            </div>
          </div>

          {branches.length > 0 && branchesWithProduct === 0 && (
            <Alert
              message="محصول مورد نظر در هیچ شعبه‌ای یافت نشد."
              type="warning"
              showIcon
              className="mt-3"
              style={{ direction: "rtl", textAlign: "right" }}
            />
          )}

          {branches.length > 0 && branchesWithProduct > 0 && (
            <div className="flex items-start">
              <EnvironmentOutlined className="text-green-400 mt-1 ml-2" />
              <div className="flex-1">
                <div className="font-medium text-gray-200 mb-2">
                  محصول در شعبه‌های زیر موجود است:
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {branches
                    .filter(
                      (branch) => (branch.specificProductQuantity || 0) > 0
                    )
                    .sort(
                      (a, b) =>
                        (b.specificProductQuantity || 0) -
                        (a.specificProductQuantity || 0)
                    )
                    .map((branch) => (
                      <Tag
                        key={branch.branchid}
                        className="bg-green-900/20 border-green-900/50 text-green-300 flex items-center gap-1 px-2 py-1"
                      >
                        <span>{branch.name}</span>
                        <span className="bg-green-900/70 text-green-200 text-xs px-1.5 py-0.5 rounded mr-1">
                          {branch.specificProductQuantity} عدد
                        </span>
                      </Tag>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductSearchSummary;
