"use client";

export const dynamic = "force-dynamic";

import { Card, Tabs } from "antd";
import { Suspense, useEffect, useRef } from "react";

import { useUser } from "@/context/UserContext";

import { useBranchCRUD } from "./hooks/useBranchCRUD";
import { useProductAssignment } from "./hooks/useProductAssignment";
import { useWarrantyStats } from "./hooks/useWarrantyStats";

import BranchList from "./components/BranchList";
import BranchModals from "./components/BranchModals";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ProductAssignment from "./components/ProductAssignment";
import Styles from "./components/Styles";
import WarrantyRequests from "./components/WarrantyRequests";
import WarrantyStats from "./components/WarrantyStats";

const { TabPane } = Tabs;

function BranchesPageContent() {
  const { user } = useUser();
  const currentUserId = user?.userId ? parseInt(user.userId) : undefined;

  const crud = useBranchCRUD();
  const assignment = useProductAssignment({
    currentBranch: crud.currentBranch,
    onBranchChange: (branch) => crud.setCurrentBranch(branch as any),
    onRefreshBranches: () => crud.fetchBranches(),
  });
  const warranty = useWarrantyStats();

  const searchProductIdSyncedRef = useRef(false);
  useEffect(() => {
    const productId = crud.searchParams.get("productId");
    if (productId && !crud.initialLoading && !searchProductIdSyncedRef.current) {
      searchProductIdSyncedRef.current = true;
      const parsedId = parseInt(productId);
      crud.setSearchProductId(parsedId);

      if (assignment.allProducts.length > 0) {
        const product = assignment.allProducts.find((p) => p.ProductId === parsedId);
        if (product && product.Type) {
          crud.setSearchValue(product.Type);
        }
      }
      crud.fetchBranches(1, crud.pagination.pageSize, parsedId);
    }
  }, [
    crud.searchParams,
    assignment.allProducts,
    crud.initialLoading,
    crud.fetchBranches,
    crud.pagination.pageSize,
  ]);

  useEffect(() => {
    Promise.all([crud.fetchBranches(), assignment.fetchAllProducts()])
      .catch((error) => console.error("Error loading initial data:", error))
      .finally(() => crud.setInitialLoading(false));

    const intervalId = setInterval(() => {
      crud.setRefreshing(true);
      crud.fetchBranchesRef.current?.().finally(() => {
        setTimeout(() => crud.setRefreshing(false), 500);
      });
    }, 30000);

    return () => clearInterval(intervalId);
  }, [crud.fetchBranches, assignment.fetchAllProducts]);

  useEffect(() => {
    crud.fetchBranchesRef.current = () =>
      crud.fetchBranches(crud.pagination.current, crud.pagination.pageSize);
  }, [crud.pagination, crud.fetchBranches]);

  if (crud.initialLoading) {
    return <LoadingSkeleton />;
  }

  const handleSearch = (value: string) => {
    crud.handleSearch(value, assignment.allProducts, crud.pagination);
  };

  return (
    <div
      className="space-y-6 rounded-lg bg-gray-950 p-4 text-white sm:p-6"
      style={{ direction: "rtl" }}
    >
      <BranchList
        branches={crud.branches}
        branchesLoading={crud.loading}
        refreshing={crud.refreshing}
        pagination={{
          current: crud.pagination.current,
          pageSize: crud.pagination.pageSize,
          total: crud.pagination.total,
          onChange: (page: number, pageSize?: number) => {
            crud.fetchBranches(page, pageSize || crud.pagination.pageSize);
          },
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ["10", "20", "50"],
          position: ["bottomCenter"],
          className: "pagination-dark",
        }}
        searchValue={crud.searchValue}
        searchProductId={crud.searchProductId}
        totalBranchCount={crud.totalBranchCount}
        allProducts={assignment.allProducts}
        onSearchValueChange={crud.setSearchValue}
        onSearch={handleSearch}
        onClearSearch={crud.clearSearch}
        onCreateBranch={() => crud.setModalVisible(true)}
        onEdit={crud.showEditBranchModal}
        onDelete={crud.handleDeleteBranch}
        onViewProducts={assignment.handleViewProducts}
        onCreateInvoice={assignment.handleCreateInvoice}
      />

      <Tabs
        activeKey={warranty.activeTab}
        className="branches-tabs mt-4"
        onChange={warranty.handleTabChange}
      >
        <TabPane tab={<span className="tab-label">شعبه‌ها</span>} key="branches" />
        <TabPane tab={<span className="tab-label">آمار گارانتی</span>} key="warranty-stats">
          <Card
            title="آمار گارانتی‌ها"
            bordered={false}
            className="bg-gray-800 text-white"
            headStyle={{ color: "white", borderBottom: "1px solid #4b5563" }}
          >
            <p className="mb-4 text-gray-400">
              آمار گارانتی‌های فعال، منقضی شده و درخواست‌های بررسی
            </p>
            <WarrantyStats
              key="warranty-stats"
              isTabActive={warranty.activeTab === "warranty-stats"}
            />
          </Card>
        </TabPane>
        <TabPane tab={<span className="tab-label">درخواست‌های بررسی</span>} key="warranty-requests">
          <Card
            title="درخواست‌های بررسی گارانتی"
            bordered={false}
            className="bg-gray-800 text-white"
            headStyle={{ color: "white", borderBottom: "1px solid #4b5563" }}
          >
            <p className="mb-4 text-gray-400">
              لیست درخواست‌های بررسی گارانتی از تمام شعبه‌ها
            </p>
            <WarrantyRequests
              key="warranty-requests"
              isTabActive={warranty.activeTab === "warranty-requests"}
            />
          </Card>
        </TabPane>
      </Tabs>

      <BranchModals
        createVisible={crud.modalVisible}
        editVisible={crud.editBranchModalVisible}
        currentBranch={crud.currentBranch}
        form={crud.form}
        editForm={crud.editForm}
        users={crud.usersData ?? []}
        currentUserId={currentUserId}
        onCreate={crud.handleCreateBranch}
        onUpdate={crud.handleUpdateBranch}
        onCloseCreate={() => crud.setModalVisible(false)}
        onCloseEdit={() => crud.setEditBranchModalVisible(false)}
      />

      <ProductAssignment
        currentBranch={crud.currentBranch}
        drawerVisible={assignment.productDrawerVisible}
        invoiceVisible={assignment.invoiceModalVisible}
        products={assignment.products}
        allProducts={assignment.allProducts}
        productsLoading={assignment.productsLoading}
        productForm={assignment.productForm}
        selectedProduct={assignment.selectedProduct}
        productQuantityRef={assignment.productQuantityRef}
        onCloseDrawer={assignment.closeDrawer}
        onCloseInvoice={assignment.closeInvoice}
        onAddProduct={assignment.handleAddProduct}
        onUpdateQuantity={assignment.handleUpdateProductQuantity}
        onRemoveProduct={assignment.handleRemoveProduct}
        onSelectProduct={assignment.setSelectedProduct}
        onQuantityChange={(value) => (assignment.productQuantityRef.current = value || 1)}
      />

      <Styles />
      <style jsx global>{`
        .branches-tabs .ant-tabs-nav-list {
          gap: 8px;
        }
        .branches-tabs .ant-tabs-tab {
          padding: 8px 16px !important;
          margin: 0 !important;
          border-radius: 6px 6px 0 0 !important;
          position: relative;
          z-index: 1;
          margin-bottom: -1px !important;
        }
        .tab-label {
          color: #e5e7eb !important;
          font-weight: 500 !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
          padding: 0 8px !important;
          font-size: 15px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .branches-tabs .ant-tabs-tab:not(.ant-tabs-tab-active) {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
        }
        .branches-tabs .ant-tabs-tab:not(.ant-tabs-tab-active):hover {
          background-color: #4b5563 !important;
        }
        .branches-tabs .ant-tabs-tab.ant-tabs-tab-active {
          background-color: #1f73f1 !important;
          border-color: #1f73f1 !important;
        }
        .branches-tabs .ant-tabs-tab.ant-tabs-tab-active .tab-label {
          color: white !important;
          font-weight: 600 !important;
        }
        .branches-tabs .ant-tabs-content {
          background-color: transparent !important;
          padding: 0 !important;
        }
        .branches-tabs .ant-tabs-nav:before {
          border-bottom-color: #4b5563 !important;
        }
        .ant-tabs-tab {
          padding: 8px 16px !important;
        }
        .ant-tabs-tab-btn {
          color: #e5e7eb !important;
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
        .custom-dropdown {
          background-color: #1f2937;
          border-color: #4b5563;
          max-height: 400px;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
          border-radius: 6px;
        }
        .custom-dropdown .ant-select-item {
          color: white;
          background-color: #1f2937;
          padding: 10px 12px;
          border-radius: 4px;
          margin: 2px 4px;
          transition: all 0.2s ease;
        }
        .custom-dropdown .ant-select-item-option-active {
          background-color: #334155;
        }
        .custom-dropdown .ant-select-item-option-selected {
          background-color: #3b82f6;
        }
        .custom-autocomplete input {
          color: white !important;
          border-radius: 6px;
          font-size: 15px;
          transition: border-color 0.2s ease;
        }
        .custom-autocomplete input:hover,
        .custom-autocomplete input:focus {
          border-color: #3b82f6 !important;
        }
        .custom-dropdown::-webkit-scrollbar {
          width: 8px;
        }
        .custom-dropdown::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        .custom-dropdown::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        .custom-dropdown::-webkit-scrollbar-thumb:hover {
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
        .custom-autocomplete .ant-select-selector {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
          height: 32px !important;
        }
        .custom-autocomplete input::placeholder {
          color: #cbd5e1 !important;
          opacity: 1 !important;
        }
        .custom-autocomplete .ant-select-selection-search {
          left: auto !important;
          right: 0 !important;
          width: 100% !important;
        }
        .search-input.ant-input {
          color: #f8fafc !important;
        }
        .search-input.ant-input:hover {
          background-color: #1e293b !important;
          border-color: #4b5563 !important;
        }
        .ant-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .search-input.ant-input:focus,
        .search-input.ant-input-focused {
          background-color: #1e293b !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }
        .ant-select-selection-placeholder {
          color: #cbd5e1 !important;
          opacity: 1 !important;
        }
        .searched-product-found-row {
          background-color: rgba(16, 185, 129, 0.05) !important;
          transition: background-color 0.3s ease;
        }
        .searched-product-found-row:hover > td {
          background-color: rgba(16, 185, 129, 0.1) !important;
        }
        .searched-product-not-found-row {
          opacity: 0.75;
          transition: opacity 0.3s ease;
        }
        .searched-product-not-found-row:hover {
          opacity: 1;
        }
        .ant-tag {
          border-radius: 4px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-family: inherit !important;
        }
        .ant-table-thead > tr > th {
          text-align: right;
        }
        .ant-table-tbody > tr > td {
          text-align: right;
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
        .ant-pagination-item {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        .ant-pagination-item a {
          color: #e5e7eb !important;
        }
        .ant-pagination-item:hover {
          border-color: #3b82f6 !important;
        }
        .ant-pagination-item:hover a {
          color: #3b82f6 !important;
        }
        .ant-pagination-item-active {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }
        .ant-pagination-item-active a {
          color: white !important;
        }
        .ant-pagination-prev button,
        .ant-pagination-next button {
          color: #e5e7eb !important;
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        .ant-pagination-prev:hover button,
        .ant-pagination-next:hover button {
          color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }
        .ant-pagination-disabled button {
          color: #6b7280 !important;
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        .ant-pagination-options-quick-jumper {
          display: none !important;
        }
        .ant-pagination-options {
          direction: rtl !important;
        }
        .ant-pagination-options-size-changer .ant-select-selector {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
          color: #e5e7eb !important;
        }
        .ant-pagination-options-size-changer:hover .ant-select-selector {
          border-color: #3b82f6 !important;
        }
        .ant-select-dropdown {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5) !important;
        }
        .ant-select-dropdown .ant-select-item {
          color: #e5e7eb !important;
        }
        .ant-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background-color: #374151 !important;
        }
        .ant-select-dropdown
          .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: #3b82f6 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}

export default function BranchesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <BranchesPageContent />
    </Suspense>
  );
}
