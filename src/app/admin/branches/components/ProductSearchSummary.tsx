import { SearchOutlined, ProjectOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Card, Tag, Typography, Alert } from "antd";

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

  return (
    <Card
      className="mb-6 overflow-hidden rounded-lg border-0 bg-gray-800 shadow-lg"
      bodyStyle={{
        backgroundColor: "#19202b",
        padding: "16px 20px",
        borderTop: "1px solid #334155",
        direction: "rtl",
      }}
    >
      <div className="flex flex-col space-y-4" style={{ direction: "rtl" }}>
        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
          <div className="mb-2 flex items-center sm:mb-0">
            <SearchOutlined className="ml-2 text-xl text-blue-400" />
            <Title level={4} className="!m-0 !font-bold !text-white">
              نتایج جستجو
            </Title>
          </div>
          <Tag
            color="blue"
            className="cursor-pointer self-start px-3 py-1.5 text-sm font-medium sm:self-auto"
            onClick={clearSearch}
          >
            پاک کردن جستجو
          </Tag>
        </div>

        <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900/50 p-4">
          <div className="flex flex-wrap items-center">
            <ProjectOutlined className="ml-2 text-blue-400" />
            <Text className="ml-1 !text-gray-300">محصول:</Text>
            <Text strong className="ml-2 !text-white">
              {productName}
            </Text>
            <Tag className="ml-2 mr-0 border-blue-800 bg-blue-900/50 text-blue-300">
              کد: {productId}
            </Tag>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-blue-900/50 bg-blue-900/20 p-3">
              <div className="mb-1 text-center text-xl font-bold text-blue-400">
                {totalQuantity}
              </div>
              <div className="text-center text-sm text-gray-300">تعداد کل موجود در همه شعبه‌ها</div>
            </div>

            <div className="rounded-lg border border-indigo-900/50 bg-indigo-900/20 p-3">
              <div className="mb-1 text-center text-xl font-bold text-indigo-400">
                {branchesWithProduct}
              </div>
              <div className="text-center text-sm text-gray-300">شعبه‌های دارای این محصول</div>
            </div>

            <div className="rounded-lg border border-purple-900/50 bg-purple-900/20 p-3">
              <div className="mb-1 text-center text-xl font-bold text-purple-400">
                {branchesWithoutProduct}
              </div>
              <div className="text-center text-sm text-gray-300">شعبه‌های بدون این محصول</div>
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
              <EnvironmentOutlined className="ml-2 mt-1 text-green-400" />
              <div className="flex-1">
                <div className="mb-2 font-medium text-gray-200">
                  محصول در شعبه‌های زیر موجود است:
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {branches
                    .filter((branch) => (branch.specificProductQuantity || 0) > 0)
                    .sort(
                      (a, b) => (b.specificProductQuantity || 0) - (a.specificProductQuantity || 0)
                    )
                    .map((branch) => (
                      <Tag
                        key={branch.branchid}
                        className="flex items-center gap-1 border-green-900/50 bg-green-900/20 px-2 py-1 text-green-300"
                      >
                        <span>{branch.name}</span>
                        <span className="mr-1 rounded bg-green-900/70 px-1.5 py-0.5 text-xs text-green-200">
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
