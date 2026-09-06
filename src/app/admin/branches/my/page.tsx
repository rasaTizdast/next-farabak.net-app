"use client";

import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Card, Empty, Spin, Button, Alert } from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

import BranchInfo from "./components/BranchInfo";
import BranchTabs from "./components/BranchTabs";
import { useBranchData, loadInitialBranchData, doAutoRefresh } from "./hooks/useBranchData";
import {
  InvoiceManagementProvider,
  useInvoiceManagement,
  StandaloneWarranty,
} from "./hooks/useInvoiceManagement";
import { useWarrantyManagement } from "./hooks/useWarrantyManagement";
import InvoiceModal from "../components/invoice/InvoiceModal";
import ProductDrawer from "../components/ProductDrawer";
import SkeletonLoading from "./components/SkeletonLoading";
import { ExpandedInvoiceItem } from "./invoices/components/branchInvoiceDetails/types";
import BranchInvoiceDetailsModal from "./invoices/components/BranchInvoiceDetailsModal";
import BranchWarrantyViewModal from "./invoices/components/BranchWarrantyViewModal";

type BranchData = ReturnType<typeof useBranchData>;

function MyBranchContent() {
  const branchData = useBranchData();

  return (
    <InvoiceManagementProvider branchRef={branchData.branchRef}>
      <MyBranchDashboard branchData={branchData} />
    </InvoiceManagementProvider>
  );
}

function MyBranchDashboard({ branchData }: { branchData: BranchData }) {
  const {
    branch,
    setBranch,
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
    productPagination,
    fetchAllProducts,
    fetchBranchProducts,
    fetchBranchProductsRef,
    handleAddProduct,
    handleUpdateProductQuantity,
    productColumns,
  } = branchData;

  const { state, actions } = useInvoiceManagement();

  const {
    invoices,
    loading: invoicesLoading,
    searchText,
    pagination: invoicePagination,
    modalVisible: invoiceModalVisible,
    warrantySummary,
  } = state.list;

  const {
    setSearchText,
    fetchInvoices,
    handleCreateInvoice,
    handleInvoiceCreationSuccess,
    setModalVisible,
  } = actions.list;

  const {
    selectedInvoice,
    selectedStandaloneWarranty,
    setSelectedInvoice,
    setSelectedStandaloneWarranty,
  } = actions.selection;

  const { searchOptions, filteredInvoices, filteredStandaloneWarranties } = actions.filters;
  const { memoizedInvoiceColumns } = actions.columns;

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
    }, 60000);

    return () => clearInterval(intervalId);
  }, [
    loadInitialBranchData,
    setLoading,
    setError,
    setAuthError,
    setBranch,
    fetchBranchProducts,
    fetchInvoices,
    fetchAllProducts,
    doAutoRefresh,
    setRefreshing,
    fetchBranchProductsRef,
  ]);

  if (loading) {
    return <SkeletonLoading />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="overflow-hidden rounded-lg bg-gray-800 text-white shadow-md">
          <div className="flex flex-col items-center justify-center py-8">
            <ExclamationCircleOutlined className="mb-4 text-5xl text-red-500" />
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

  const handleViewWarranty = (warranty: StandaloneWarranty) => {
    const warrantyItem: ExpandedInvoiceItem = {
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
          onClose={() => setModalVisible(false)}
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
