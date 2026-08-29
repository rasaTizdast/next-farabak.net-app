"use client";

export const dynamic = "force-dynamic";

import { Card, Tabs } from "antd";
import { Suspense, useEffect, useRef } from "react";

import { adminColors } from "@/constants/adminColors";
import { useUser } from "@/context/UserContext";

import BranchList from "./components/BranchList";
import BranchModals from "./components/BranchModals";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ProductAssignment from "./components/ProductAssignment";
import WarrantyRequests from "./components/WarrantyRequests";
import WarrantyStats from "./components/WarrantyStats";
import { useBranchCRUD } from "./hooks/useBranchCRUD";
import { useProductAssignment } from "./hooks/useProductAssignment";
import { useWarrantyStats } from "./hooks/useWarrantyStats";

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
  const latestFetchBranchesRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const refreshTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
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
    crud.setSearchProductId,
    crud.setSearchValue,
  ]);

  useEffect(() => {
    Promise.all([crud.fetchBranches(), assignment.fetchAllProducts()])
      .catch((error) => console.error("Error loading initial data:", error))
      .finally(() => crud.setInitialLoading(false));

    const intervalId = setInterval(() => {
      crud.setRefreshing(true);
      latestFetchBranchesRef.current?.().finally(() => {
        refreshTimeoutIdRef.current = setTimeout(() => crud.setRefreshing(false), 500);
      });
    }, 30000);

    return () => {
      clearInterval(intervalId);
      if (refreshTimeoutIdRef.current) {
        clearTimeout(refreshTimeoutIdRef.current);
      }
    };
  }, [crud.fetchBranches, assignment.fetchAllProducts, crud.setInitialLoading, crud.setRefreshing]);

  useEffect(() => {
    latestFetchBranchesRef.current = () =>
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
          className: "pagination-dark [&_.ant-pagination-options-quick-jumper]:!hidden",
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
        className="branches-tabs mt-4 [&_.ant-tabs-content]:bg-transparent! [&_.ant-tabs-content]:p-0! [&_.ant-tabs-nav-list]:gap-2 [&_.ant-tabs-nav::before]:border-b-gray-600! [&_.ant-tabs-tab]:relative [&_.ant-tabs-tab]:z-1 [&_.ant-tabs-tab]:m-0! [&_.ant-tabs-tab]:-mb-px! [&_.ant-tabs-tab]:rounded-t-md! [&_.ant-tabs-tab]:px-4! [&_.ant-tabs-tab]:py-2! [&_.ant-tabs-tab.ant-tabs-tab-active]:border-[#1f73f1]! [&_.ant-tabs-tab.ant-tabs-tab-active]:bg-[#1f73f1]! [&_.ant-tabs-tab.ant-tabs-tab-active_.tab-label]:font-semibold! [&_.ant-tabs-tab.ant-tabs-tab-active_.tab-label]:text-white! [&_.ant-tabs-tab:not(.ant-tabs-tab-active)]:border-gray-600! [&_.ant-tabs-tab:not(.ant-tabs-tab-active)]:bg-gray-700! [&_.ant-tabs-tab:not(.ant-tabs-tab-active):hover]:bg-gray-600!"
        onChange={warranty.handleTabChange}
      >
        <TabPane
          tab={
            <span className="tab-label flex! items-center! gap-2! px-2! text-[15px]! font-medium! text-gray-200! [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
              شعبه‌ها
            </span>
          }
          key="branches"
        />
        <TabPane
          tab={
            <span className="tab-label flex! items-center! gap-2! px-2! text-[15px]! font-medium! text-gray-200! [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
              آمار گارانتی
            </span>
          }
          key="warranty-stats"
        >
          <Card
            title="آمار گارانتی‌ها"
            bordered={false}
            className="bg-gray-800 text-white"
            headStyle={{ color: "white", borderBottom: `1px solid ${adminColors.borderLight}` }}
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
        <TabPane
          tab={
            <span className="tab-label flex! items-center! gap-2! px-2! text-[15px]! font-medium! text-gray-200! [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
              درخواست‌های بررسی
            </span>
          }
          key="warranty-requests"
        >
          <Card
            title="درخواست‌های بررسی گارانتی"
            bordered={false}
            className="bg-gray-800 text-white"
            headStyle={{ color: "white", borderBottom: `1px solid ${adminColors.borderLight}` }}
          >
            <p className="mb-4 text-gray-400">لیست درخواست‌های بررسی گارانتی از تمام شعبه‌ها</p>
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
        // eslint-disable-next-line react-hooks/immutability -- productQuantityRef is owned by the useProductAssignment hook (in hooks/useProductAssignment.tsx); mutating it here is required by that hook's API.
        onQuantityChange={(value) => (assignment.productQuantityRef.current = value || 1)}
      />
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
