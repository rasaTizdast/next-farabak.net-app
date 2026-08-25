"use client";

import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Input, TablePaginationConfig } from "antd";
import React from "react";

import BranchTable from "./BranchTable";
import ProductSearchSummary from "./ProductSearchSummary";
import { Branch, Product } from "./types";

interface BranchListProps {
  branches: Branch[];
  branchesLoading: boolean;
  refreshing: boolean;
  pagination: TablePaginationConfig;
  searchValue: string;
  searchProductId: number | null;
  totalBranchCount: number;
  allProducts: Product[];
  onSearchValueChange: (value: string) => void;
  onSearch: (value: string) => void;
  onClearSearch: () => void;
  onCreateBranch: () => void;
  onEdit: (branch: Branch) => void;
  onDelete: (branchId: number) => void;
  onViewProducts: (branch: Branch) => void;
  onCreateInvoice: (branch: Branch) => void;
}

function getSearchOptions(allProducts: Product[], searchValue: string) {
  if (!allProducts || allProducts.length === 0) return [];

  if (!searchValue || searchValue.trim() === "") {
    return allProducts.map((product) => ({
      value: product.Type || "",
      label: (
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">{product.Type}</span>
          <span className="rounded-md bg-blue-900/30 px-2 py-0.5 text-xs text-blue-300">
            کد: {product.ProductId}
          </span>
        </div>
      ),
    }));
  }

  const lowerCaseSearch = searchValue.toLowerCase();

  return allProducts.reduce<{ value: string; label: React.JSX.Element }[]>((acc, product) => {
    if (product.Type && product.Type.toLowerCase().includes(lowerCaseSearch)) {
      acc.push({
        value: product.Type,
        label: (
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">{product.Type}</span>
            <span className="rounded-md bg-blue-900/30 px-2 py-0.5 text-xs text-blue-300">
              کد: {product.ProductId}
            </span>
          </div>
        ),
      });
    }
    return acc;
  }, []);
}

const BranchList: React.FC<BranchListProps> = ({
  branches,
  branchesLoading,
  refreshing,
  pagination,
  searchValue,
  searchProductId,
  totalBranchCount,
  allProducts,
  onSearchValueChange,
  onSearch,
  onClearSearch,
  onCreateBranch,
  onEdit,
  onDelete,
  onViewProducts,
  onCreateInvoice,
}) => {
  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">مدیریت شعبه‌ها</h1>
          <p className="text-sm text-gray-400">
            از اینجا می‌توانید شعبه‌ها و محصولات آنها را مدیریت کنید
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <div className="relative w-full sm:w-72">
            <AutoComplete
              placeholder="جستجوی محصول در شعبه‌ها..."
              value={searchValue}
              onChange={(value) => {
                onSearchValueChange(value);
                if (!value.trim()) {
                  onClearSearch();
                }
              }}
              onSelect={onSearch}
              options={getSearchOptions(allProducts, searchValue)}
              style={{
                width: "100%",
                direction: "rtl",
              }}
              className="custom-autocomplete w-full [&_.ant-select-selection-search]:!right-0 [&_.ant-select-selection-search]:!left-auto [&_.ant-select-selection-search]:!w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!p-0 [&_input]:rounded-md [&_input]:text-[15px] [&_input]:!text-white [&_input]:!placeholder-slate-300 [&_input:focus]:!border-blue-500 [&_input:hover]:!border-blue-500"
              popupMatchSelectWidth={false}
              popupClassName="enhanced-dropdown !bg-gray-800 !border !border-gray-600 !rounded-lg !shadow-[0_8px_16px_rgba(0,0,0,0.5)] !overflow-hidden !py-1.5 [&_.ant-select-item]:!my-0.5 [&_.ant-select-item]:!mx-1.5 [&_.ant-select-item]:!rounded [&_.ant-empty-description]:!text-gray-200"
              listHeight={400}
              listItemHeight={38}
              showSearch
              filterOption={false}
            >
              <Input
                className="search-input border-[#384152] bg-[#1e293b] pl-12 text-white hover:!border-[#4b5563] focus:!border-blue-500 focus:!bg-[#1e293b] focus:!shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"
                style={{
                  height: "32px",
                  direction: "rtl",
                  textAlign: "right",
                }}
                onPressEnter={() => onSearch(searchValue)}
              />
            </AutoComplete>
            <Button
              type="primary"
              icon={<SearchOutlined style={{ fontSize: "14px" }} />}
              onClick={() => {
                if (searchValue.trim()) {
                  onSearch(searchValue);
                } else {
                  onClearSearch();
                }
              }}
              className="absolute top-0 left-0 flex h-full items-center justify-center rounded-l-md rounded-r-none border-0 bg-blue-600 hover:bg-blue-700"
              style={{ width: "40px" }}
            />
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateBranch}
            className="w-full border-blue-700 bg-blue-600 hover:bg-blue-700 sm:w-auto"
          >
            ایجاد شعبه
          </Button>
        </div>
      </div>

      {searchProductId && allProducts.length > 0 && (
        <ProductSearchSummary
          productName={
            allProducts.find((p) => p.ProductId === searchProductId)?.Type || "محصول نامشخص"
          }
          productId={searchProductId}
          branches={branches}
          clearSearch={onClearSearch}
          totalBranchCount={totalBranchCount}
        />
      )}

      <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
        <BranchTable
          branches={branches}
          loading={branchesLoading || refreshing}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewProducts={onViewProducts}
          onCreateInvoice={onCreateInvoice}
          isSearching={!!searchProductId}
          pagination={pagination}
        />
      </div>
    </>
  );
};

export default BranchList;
