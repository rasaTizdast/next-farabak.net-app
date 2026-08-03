"use client";

export const dynamic = "force-dynamic";

import {
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  Card,
  Empty,
  Spin,
  Button,
  Alert,
} from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

import { useBranchData } from "./hooks/useBranchData";
import { useInvoiceManagement } from "./hooks/useInvoiceManagement";
import { useWarrantyManagement } from "./hooks/useWarrantyManagement";

import BranchInfo from "./components/BranchInfo";
import BranchTabs from "./components/BranchTabs";
import InvoiceModal from "../components/invoice/InvoiceModal";
import ProductDrawer from "../components/ProductDrawer";
import Styles from "../components/Styles";
import SkeletonLoading from "./components/SkeletonLoading";
import BranchInvoiceDetailsModal from "./invoices/components/BranchInvoiceDetailsModal";
import BranchWarrantyViewModal from "./invoices/components/BranchWarrantyViewModal";

import { loadInitialBranchData, doAutoRefresh } from "./hooks/useBranchData";

function MyBranchContent() {
  const {
    branch,
    setBranch,
    branchRef,
    products,
    allProducts,
    loading,
    setLoading,
    productsLoading,
    refreshing,
    setRefreshing,
    error,
    setError,
    authError,
    setAuthError,
    productDrawerVisible,
    setProductDrawerVisible,
    selectedProduct,
    setSelectedProduct,
    productQuantityRef,
    productForm,
    debouncedQuantities,
    quantityTimersRef,
    productPagination,
    fetchAllProducts,
    fetchBranchProducts,
    fetchBranchProductsRef,
    handleAddProduct,
    handleUpdateProductQuantity,
    handleDebouncedQuantityChange,
    productColumns,
  } = useBranchData();

  const {
    invoices,
    invoicesLoading,
    setInvoicesLoading,
    searchText,
    setSearchText,
    selectedInvoice,
    setSelectedInvoice,
    selectedStandaloneWarranty,
    setSelectedStandaloneWarranty,
    warrantySummary,
    invoicePagination,
    invoiceModalVisible,
    setInvoiceModalVisible,
    fetchInvoices,
    handleCreateInvoice,
    handleInvoiceCreationSuccess,
    searchOptions,
    filteredInvoices,
    filteredStandaloneWarranties,
    memoizedInvoiceColumns,
  } = useInvoiceManagement(branchRef);

  const { activeTab, handleTabChange } = useWarrantyManagement();

  const searchParams = useSearchParams();
  const router = useRouter();

  const isUnauthorized = searchParams.get("unauthorized") === "true";
  const attemptedPath = searchParams.get("attempted");

  useEffect(() => {
    loadInitialBranchData(
      setLoading,
      setError,
      setAuthError,
      setBranch,
      fetchBranchProducts,
      fetchInvoices,
      fetchAllProducts
    );

    const intervalId = setInterval(() => {
      doAutoRefresh(setRefreshing, setBranch, fetchBranchProductsRef);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <SkeletonLoading />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="overflow-hidden rounded-lg bg-gray-800 text-white shadow-md">
          <div className="flex flex-col items-center justify-center py-8">
            <ExclamationCircleOutlined
              style={{ fontSize: 48, color: "#f5222d", marginBottom: 16 }}
            />
            <h1 className="text-center text-xl font-bold">{error}</h1>
            {authError ? (
              <div className="mt-4 text-center">
                <p className="mb-4 text-gray-300">
                  ممکن است نشست کاری شما منقضی شده باشد. لطفاً دوباره وارد شوید.
                </p>
                <Button
                  htmlType="button"
                  type="primary"
                  onClick={() => router.push("/auth/login")}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  ورود مجدد
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-center text-gray-300">
                برای تعریف شعبه جدید، لطفاً با مدیر سیستم در تماس باشید.
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="p-6">
        <Card className="overflow-hidden rounded-lg bg-gray-800 text-white shadow-md">
          <Empty
            description="اطلاعات شعبه در دسترس نیست"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="text-gray-400"
          />
        </Card>
      </div>
    );
  }

  const handleViewWarranty = (warranty: any) => {
    const warrantyItem = {
      Invoice_Details: String(warranty.invoicedetailid || ""),
      ProductId: String(warranty.ProductId || ""),
      quantity: warranty.quantity || 1,
      price: warranty.price || 0,
      total_price: (warranty.price || 0) * (warranty.quantity || 1),
      Name: warranty.Type,
      Type: warranty.Type,
      individualWarranty: {
        ...warranty,
        warrantyid: String(warranty.warrantyid || ""),
        invoicedetailid: String(warranty.invoicedetailid || ""),
        ProductId: String(warranty.ProductId || ""),
        branchid: String(warranty.branchid || ""),
        branchname: branch?.name,
      },
    };
    setSelectedStandaloneWarranty(warrantyItem);
  };

  return (
    <div className="p-6">
      {isUnauthorized && (
        <Alert
          message="دسترسی محدود"
          description={`شما به عنوان کاربر شعبه فقط می‌توانید به صفحه مدیریت شعبه خود دسترسی داشته باشید. دسترسی به مسیر ${attemptedPath} امکان‌پذیر نیست.`}
          type="warning"
          showIcon
          closable
          className="mb-6"
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">مدیریت شعبه من</h1>
        <div className="flex items-center gap-3">
          {refreshing && (
            <div className="flex items-center text-blue-400">
              <Spin size="small" className="ml-2" />
              <span>در حال بروزرسانی...</span>
            </div>
          )}
        </div>
      </div>

      <BranchInfo branch={branch} />

      <BranchTabs
        activeTab={activeTab}
        onTabChange={(key) => handleTabChange(key, fetchInvoices)}
        products={products}
        productsLoading={productsLoading}
        productPagination={productPagination}
        productColumns={productColumns}
        branch={branch}
        onAddProduct={() => setProductDrawerVisible(true)}
        onProductPageChange={(page, pageSize) => {
          fetchBranchProducts(branch.branchid, page, pageSize);
        }}
        invoices={invoices}
        invoicesLoading={invoicesLoading}
        invoicePagination={invoicePagination}
        searchText={searchText}
        searchOptions={searchOptions}
        filteredInvoices={filteredInvoices}
        filteredStandaloneWarranties={filteredStandaloneWarranties}
        warrantySummary={warrantySummary}
        memoizedInvoiceColumns={memoizedInvoiceColumns}
        branchName={branch.name}
        onSearchChange={setSearchText}
        onRefreshInvoices={() => fetchInvoices()}
        onCreateInvoice={handleCreateInvoice}
        onInvoicePageChange={(page, pageSize) => fetchInvoices(page, pageSize)}
        onViewInvoice={setSelectedInvoice}
        onViewWarranty={handleViewWarranty}
      />

      {branch && (
        <InvoiceModal
          visible={invoiceModalVisible}
          onClose={() => setInvoiceModalVisible(false)}
          branch={branch}
          onSuccess={handleInvoiceCreationSuccess}
        />
      )}

      <ProductDrawer
        visible={productDrawerVisible}
        onClose={() => setProductDrawerVisible(false)}
        branch={branch}
        products={products}
        allProducts={allProducts}
        loading={productsLoading}
        productForm={productForm}
        selectedProduct={selectedProduct}
        onSelectProduct={setSelectedProduct}
        onQuantityChange={(value) => value !== null && (productQuantityRef.current = value)}
        onAddProduct={handleAddProduct}
        onUpdateQuantity={handleUpdateProductQuantity}
      />

      {selectedInvoice && (
        <BranchInvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => {
            setSelectedInvoice(null);
            fetchInvoices();
          }}
        />
      )}

      {selectedStandaloneWarranty && (
        <BranchWarrantyViewModal
          item={selectedStandaloneWarranty}
          onClose={() => {
            setSelectedStandaloneWarranty(null);
            fetchInvoices();
          }}
        />
      )}

      <Styles />

      <style jsx global>{`
        .branch-invoices-table .ant-table,
        .branch-invoices-table .ant-table-thead > tr > th {
          background-color: #1f2937;
          color: white;
          border-color: #4b5563;
        }

        .branch-invoices-table .ant-table-tbody > tr > td {
          border-color: #4b5563;
          transition: background 0.2s;
        }

        .branch-invoices-table .ant-table-tbody > tr.ant-table-row:hover > td {
          background-color: #374151;
        }

        .branch-invoices-table .ant-table-tbody > tr:nth-child(odd) {
          background-color: #1f2937;
        }

        .branch-invoices-table .ant-table-tbody > tr:nth-child(even) {
          background-color: #263346;
        }

        .branch-invoices-table .ant-pagination {
          color: white;
          direction: ltr;
        }

        .branch-invoices-table .ant-pagination-item a {
          color: white;
        }

        .branch-invoices-table .ant-pagination-item-active {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        .branch-invoices-table .ant-empty-description {
          color: white;
        }

        .ant-tag {
          direction: rtl;
        }

        .custom-dropdown {
          background-color: #1f2937;
          border-color: #4b5563;
        }

        .custom-dropdown .ant-select-item {
          color: white;
          background-color: #1f2937;
        }

        .custom-dropdown .ant-select-item-option-active {
          background-color: #374151;
        }

        .custom-dropdown .ant-select-item-option-selected {
          background-color: #2563eb;
        }

        .custom-autocomplete input {
          color: white !important;
        }

        .ant-tabs-tab {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
        }

        .ant-tabs-tab-active {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }

        .ant-tabs-content {
          background-color: #1f2937;
          padding: 16px;
          border-radius: 0 0 8px 8px;
        }

        .ant-select-dropdown {
          background-color: #1f2937;
          max-height: 400px;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
          border-radius: 6px;
        }

        .ant-select-item {
          color: white !important;
          background-color: #1f2937 !important;
          padding: 10px 12px !important;
          border-radius: 4px !important;
          margin: 2px 4px !important;
          transition: all 0.2s ease !important;
        }

        .ant-select-item-option-active {
          background-color: #334155 !important;
        }

        .ant-select-item-option-selected {
          background-color: #3b82f6 !important;
        }

        .ant-select .ant-select-selector,
        .ant-select input {
          border-radius: 6px !important;
          font-size: 15px !important;
          transition: border-color 0.2s ease !important;
        }

        .ant-select:hover .ant-select-selector,
        .ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
        }

        .ant-select-dropdown::-webkit-scrollbar {
          width: 8px;
        }

        .ant-select-dropdown::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }

        .ant-select-dropdown::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .ant-select-dropdown::-webkit-scrollbar-thumb:hover {
          background-color: #6b7280;
        }

        .enhanced-dropdown {
          background-color: #1f2937 !important;
          border: 1px solid #4b5563 !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5) !important;
          overflow: hidden !important;
          padding: 6px 0 !important;
        }

        .enhanced-dropdown .ant-select-item {
          margin: 2px 6px !important;
          border-radius: 4px !important;
        }

        .enhanced-dropdown .ant-empty-description {
          color: #e5e7eb !important;
        }

        .ant-btn > .anticon + span,
        .ant-btn > span + .anticon {
          margin-right: 8px;
          margin-left: 0;
        }

        .ant-btn-icon-only.ant-btn-sm > * {
          font-size: 14px;
        }

        button.ant-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .ant-input-group-addon:first-child {
          border-start-end-radius: 0;
          border-end-end-radius: 0;
          border-start-start-radius: 6px;
          border-end-start-radius: 6px;
        }

        .ant-input-group-addon:last-child {
          border-start-start-radius: 0;
          border-end-start-radius: 0;
          border-start-end-radius: 6px;
          border-end-end-radius: 6px;
        }

        .ant-drawer .ant-drawer-content {
          direction: rtl;
        }

        @media (max-width: 768px) {
          .ant-table {
            font-size: 12px;
          }

          .ant-table-cell {
            padding: 8px 4px !important;
          }

          .ant-btn-sm {
            padding: 0 4px;
            font-size: 12px;
          }

          .ant-tabs-tab {
            padding: 8px 6px !important;
          }
        }

        .invoice-warranty-tabs .ant-tabs-nav {
          margin-bottom: 0;
        }

        .invoice-warranty-tabs .ant-tabs-tab {
          background-color: #1e293b !important;
          border-color: #334155 !important;
          border-radius: 8px 8px 0 0 !important;
          margin-right: 15px !important;
          padding: 10px 16px !important;
          transition: all 0.2s ease;
        }

        .invoice-warranty-tabs .ant-tabs-tab:hover {
          background-color: #2b5194 !important;
        }

        .invoice-warranty-tabs .ant-tabs-tab-active {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }

        .invoice-warranty-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: white !important;
          font-weight: 500;
        }

        .invoice-warranty-tabs .ant-tabs-content {
          background-color: #1f2937;
          padding: 20px;
          border-radius: 0 0 8px 8px;
        }

        .invoice-warranty-tabs .ant-empty-description {
          color: #e5e7eb !important;
        }

        .enhanced-table .ant-table-thead > tr > th {
          background-color: #263244 !important;
          color: white !important;
          font-weight: 600 !important;
          padding: 16px 12px !important;
          border-color: #374151 !important;
        }

        .enhanced-table .ant-table-tbody > tr > td {
          border-color: #374151 !important;
          padding: 12px !important;
          transition: background 0.2s ease;
        }

        .enhanced-table .ant-table-tbody > tr:nth-child(odd) {
          background-color: #1f2937 !important;
        }

        .enhanced-table .ant-table-tbody > tr:nth-child(even) {
          background-color: #1a2234 !important;
        }

        .enhanced-table .ant-table-tbody > tr.ant-table-row:hover > td {
          background-color: #2d3748 !important;
        }

        .unread-invoice-row {
          background-color: rgba(245, 158, 11, 0.15) !important;
        }

        .unread-invoice-row:hover > td {
          background-color: rgba(245, 158, 11, 0.25) !important;
        }

        .ant-tag {
          border-radius: 4px !important;
          font-family: inherit !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
        }

        .ant-btn,
        .ant-input,
        .ant-select,
        .ant-pagination,
        .ant-table,
        .ant-modal-content,
        .ant-tag,
        .ant-badge,
        .ant-tabs,
        .ant-dropdown,
        .ant-tooltip,
        .ant-empty,
        .ant-card {
          font-family: inherit !important;
        }

        .ant-select-selection-search-input,
        .ant-input-affix-wrapper {
          border-radius: 8px !important;
        }

        .ant-input-affix-wrapper:hover,
        .ant-input-affix-wrapper:focus,
        .ant-input-affix-wrapper-focused {
          border-color: #000442 !important;
          box-shadow: 0 0 0 2px rgba(8, 0, 160, 0.2) !important;
        }

        .ant-btn {
          border-radius: 6px !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
          font-weight: 500 !important;
        }

        .ant-btn-primary {
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1) !important;
        }

        .ant-input-affix-wrapper .ant-input::placeholder {
          text-align: center !important;
          opacity: 1 !important;
        }

        .ant-select-selection-search-input::placeholder {
          text-align: center !important;
          opacity: 1 !important;
        }

        .ant-tag-warning {
          background-color: #faad14 !important;
          color: #000 !important;
          font-weight: 500 !important;
        }

        .ant-tag-success {
          background-color: #52c41a !important;
          color: #fff !important;
          font-weight: 500 !important;
        }

        .ant-input-affix-wrapper {
          border-radius: 8px !important;
          height: 42px !important;
        }

        .ant-input-suffix .anticon-search {
          color: #ffffff !important;
          opacity: 0.7;
        }

        .ant-tabs-tab {
          padding: 8px 16px !important;
        }

        .ant-tabs-tab-btn {
          color: white !important;
          font-weight: 500 !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
        }

        .ant-tabs-tab:not(.ant-tabs-tab-active) {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
        }

        .ant-tabs-tab.ant-tabs-tab-active {
          background-color: #1f73f1 !important;
          border-color: #1f73f1 !important;
        }

        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: white !important;
          font-weight: 600 !important;
        }

        .ant-tabs-nav:before {
          border-bottom-color: #4b5563 !important;
        }

        .rtl-table .ant-table-container table {
          direction: rtl;
        }

        .rtl-table .ant-table-pagination {
          direction: rtl !important;
          margin: 16px 0;
        }

        .rtl-table .ant-pagination-prev {
          transform: rotate(180deg);
        }

        .rtl-table .ant-pagination-next {
          transform: rotate(180deg);
        }

        .pagination-dark .ant-pagination-item {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }

        .pagination-dark .ant-pagination-item a {
          color: #e5e7eb !important;
        }

        .pagination-dark .ant-pagination-item:hover {
          border-color: #3b82f6 !important;
        }

        .pagination-dark .ant-pagination-item:hover a {
          color: #3b82f6 !important;
        }

        .pagination-dark .ant-pagination-item-active {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }

        .pagination-dark .ant-pagination-item-active a {
          color: white !important;
        }

        .pagination-dark .ant-pagination-prev button,
        .pagination-dark .ant-pagination-next button {
          color: #e5e7eb !important;
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }

        .pagination-dark .ant-pagination-prev:hover button,
        .pagination-dark .ant-pagination-next:hover button {
          color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }

        .pagination-dark .ant-pagination-disabled button {
          color: #6b7280 !important;
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }

        .pagination-dark .ant-pagination-options-quick-jumper {
          display: none !important;
        }

        .pagination-dark .ant-pagination-options {
          direction: rtl !important;
        }

        .pagination-dark .ant-pagination-options .ant-select-selection-item::after {
          content: " / صفحه" !important;
          display: inline !important;
        }

        .pagination-dark .ant-select-dropdown .ant-select-item-option-content::after {
          content: " / صفحه" !important;
        }

        .pagination-dark .ant-pagination-options-size-changer .ant-select-selector {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
          color: #e5e7eb !important;
        }

        .pagination-dark .ant-pagination-options-size-changer:hover .ant-select-selector {
          border-color: #3b82f6 !important;
        }

        .branch-product-search .ant-select-selector {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: white !important;
        }

        .branch-product-search .ant-select-selection-placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }

        .branch-product-search .ant-select-arrow {
          color: #9ca3af !important;
        }

        .branch-product-search .ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }

        .branch-product-search .ant-input {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: white !important;
        }

        .branch-product-search .ant-input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }

        .branch-product-search .ant-input:focus,
        .branch-product-search .ant-input-focused {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }

        .branch-result-table .ant-table {
          background-color: #1f2937 !important;
        }

        .branch-result-table .ant-table-thead > tr > th {
          background-color: #263244 !important;
          color: white !important;
          font-weight: 600 !important;
          padding: 16px 12px !important;
          border-color: #374151 !important;
        }

        .branch-result-table .ant-table-tbody > tr > td {
          border-color: #374151 !important;
          padding: 12px !important;
          transition: background 0.2s ease;
        }

        .branch-result-table .ant-table-tbody > tr:nth-child(odd) {
          background-color: #1f2937 !important;
        }

        .branch-result-table .ant-table-tbody > tr:nth-child(even) {
          background-color: #1a2234 !important;
        }

        .branch-result-table .ant-table-tbody > tr.ant-table-row:hover > td {
          background-color: #2d3748 !important;
        }

        .rtl-modal .ant-modal-content {
          direction: rtl;
          text-align: right;
        }

        .rtl-modal .ant-modal-header {
          direction: rtl;
          text-align: right;
        }

        .rtl-modal .ant-modal-title {
          text-align: right;
        }

        .rtl-modal .ant-modal-footer {
          text-align: left;
        }

        .rtl-modal .ant-form-item-label {
          text-align: right;
        }

        .rtl-modal .ant-input-number-handler-wrap {
          right: auto;
          left: 0;
          border-right: 1px solid #434343;
          border-left: 0;
        }
      `}</style>
    </div>
  );
}

export default function MyBranchPage() {
  return (
    <Suspense fallback={<SkeletonLoading />}>
      <MyBranchContent />
    </Suspense>
  );
}