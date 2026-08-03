"use client";

import { Tabs, Badge } from "antd";
import { AdminInvoice } from "@/app/admin/invoices/type";
import { Product } from "../../components/types";
import ProductTab from "./ProductTab";
import InvoiceTab from "./InvoiceTab";
import WarrantyTab from "./WarrantyTab";

interface BranchTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  products: Product[];
  productsLoading: boolean;
  productPagination: { current: number; pageSize: number; total: number };
  productColumns: any[];
  branch: { branchid: number } | null;
  onAddProduct: () => void;
  onProductPageChange: (page: number, pageSize: number) => void;
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
  onRefreshInvoices: () => void;
  onCreateInvoice: () => void;
  onInvoicePageChange: (page: number, pageSize: number) => void;
  onViewInvoice: (invoice: AdminInvoice) => void;
  onViewWarranty: (warranty: any, branchName?: string) => void;
}

export default function BranchTabs({
  activeTab,
  onTabChange,
  products,
  productsLoading,
  productPagination,
  productColumns,
  branch,
  onAddProduct,
  onProductPageChange,
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
  onRefreshInvoices,
  onCreateInvoice,
  onInvoicePageChange,
  onViewInvoice,
  onViewWarranty,
}: BranchTabsProps) {
  return (
    <Tabs
      activeKey={activeTab}
      onChange={onTabChange}
      className="invoice-warranty-tabs mb-6 rounded-lg bg-gray-800 pt-4 text-white"
      type="card"
      items={[
        {
          key: "products",
          label: <span className="px-3 py-1 text-base font-medium text-white">محصولات</span>,
          children: (
            <ProductTab
              products={products}
              productsLoading={productsLoading}
              productPagination={productPagination}
              productColumns={productColumns}
              branch={branch}
              onAddProduct={onAddProduct}
              onPageChange={onProductPageChange}
            />
          ),
        },
        {
          key: "invoices",
          label: (
            <span className="flex items-center px-3 py-1 text-base font-medium text-white">
              فاکتورها و گارانتی‌ها
              {warrantySummary.active > 0 && (
                <Badge
                  count={warrantySummary.active}
                  style={{
                    backgroundColor: "#52c41a",
                    marginRight: "8px",
                    fontFamily: "inherit",
                  }}
                />
              )}
            </span>
          ),
          children: (
            <InvoiceTab
              invoices={invoices}
              invoicesLoading={invoicesLoading}
              invoicePagination={invoicePagination}
              searchText={searchText}
              searchOptions={searchOptions}
              filteredInvoices={filteredInvoices}
              filteredStandaloneWarranties={filteredStandaloneWarranties}
              warrantySummary={warrantySummary}
              memoizedInvoiceColumns={memoizedInvoiceColumns}
              branchName={branchName}
              onSearchChange={onSearchChange}
              onRefresh={onRefreshInvoices}
              onCreateInvoice={onCreateInvoice}
              onInvoicePageChange={onInvoicePageChange}
              onViewInvoice={onViewInvoice}
              onViewWarranty={onViewWarranty}
            />
          ),
        },
        {
          key: "warranty-requests",
          label: (
            <span className="px-3 py-1 text-base font-medium text-white">
              درخواست‌های گارانتی
            </span>
          ),
          children: <WarrantyTab tabKey="warranty-requests" />,
        },
        {
          key: "warranty-stats",
          label: (
            <span className="px-3 py-1 text-base font-medium text-white">آمار گارانتی‌ها</span>
          ),
          children: <WarrantyTab tabKey="warranty-stats" />,
        },
      ]}
    />
  );
}