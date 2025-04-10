"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, Suspense } from "react";
import { Button, Form, message, Input, AutoComplete, Tabs, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { Branch, User, Product } from "./components/types";
import BranchTable from "./components/BranchTable";
import CreateBranchModal from "./components/CreateBranchModal";
import EditBranchModal from "./components/EditBranchModal";
import ProductDrawer from "./components/ProductDrawer";
import LoadingSkeleton from "./components/LoadingSkeleton";
import Styles from "./components/Styles";
import InvoiceModal from "./components/invoice/InvoiceModal";
import ProductSearchSummary from "./components/ProductSearchSummary";
import WarrantyStats from "./components/WarrantyStats";
import WarrantyRequests from "./components/WarrantyRequests";

const { TabPane } = Tabs;

function BranchesPageContent() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true); // For initial page load
  const [refreshing, setRefreshing] = useState(false); // New state for refresh indicator
  const [modalVisible, setModalVisible] = useState(false);
  const [productDrawerVisible, setProductDrawerVisible] = useState(false);
  const [editBranchModalVisible, setEditBranchModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [productForm] = Form.useForm();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchProductId, setSearchProductId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("branches"); // Track the active tab
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create refs for the fetch functions to use in intervals
  const fetchBranchesRef = useRef<() => Promise<void>>();
  const fetchBranchProductsRef = useRef<(branchId: number) => Promise<void>>();

  // Check URL for productId param
  useEffect(() => {
    const productId = searchParams.get("productId");
    if (productId && !initialLoading) {
      const parsedId = parseInt(productId);
      setSearchProductId(parsedId);
      
      // Find product name to set in search value
      if (allProducts.length > 0) {
        const product = allProducts.find(
          (p) => p.ProductId === parsedId
        );
        if (product && product.Type) {
          setSearchValue(product.Type);
        }
      }
    }
  }, [searchParams, allProducts, initialLoading]);

  // Load data when component mounts and set up auto-refresh
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);

      try {
        await Promise.all([fetchBranches(), fetchUsers(), fetchAllProducts()]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();

    // Set up auto-refresh interval (30 seconds)
    const intervalId = setInterval(() => {
      setRefreshing(true);
      fetchBranchesRef.current?.().finally(() => {
        setTimeout(() => setRefreshing(false), 500); // Show loading for at least 500ms for UX
      });
    }, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchBranches = async (
    page: number = pagination.current,
    pageSize: number = pagination.pageSize
  ) => {
    try {
      setLoading(true);
      let url = `/api/admin/branches?page=${page}&limit=${pageSize}`;

      // Add product filter if searchProductId is set
      if (searchProductId) {
        url += `&productId=${searchProductId}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("خطا در دریافت شعبه‌ها");
      const responseData = await response.json();

      // Update branches and pagination data
      setBranches(responseData.data);
      setPagination({
        current: responseData.pagination.currentPage,
        pageSize: pageSize,
        total: responseData.pagination.totalCount,
      });
    } catch (error) {
      console.error("Error fetching branches:", error);
      message.error("خطا در بارگذاری شعبه‌ها");
    } finally {
      setLoading(false);
    }
  };

  // Refetch branches when searchProductId changes
  useEffect(() => {
    // Reset to page 1 when filters change
    fetchBranches(1, pagination.pageSize);
  }, [searchProductId]);

  // Store the fetchBranches function in the ref to use in the interval
  useEffect(() => {
    fetchBranchesRef.current = () =>
      fetchBranches(pagination.current, pagination.pageSize);
  }, [searchProductId, pagination.current, pagination.pageSize]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("خطا در دریافت کاربران");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("خطا در بارگذاری کاربران");
    }
  };

  const fetchAllProducts = async () => {
    try {
      setProductsLoading(true);

      // Try the new all products endpoint first
      try {
        const response = await fetch("/api/admin/products/all", {
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (response.ok) {
          const responseData = await response.json();

          if (
            responseData.data &&
            Array.isArray(responseData.data) &&
            responseData.data.length > 0
          ) {
            setAllProducts(responseData.data);
            return; // Exit if successful
          }
        }
      } catch (error) {
        console.error("Error with new endpoint:", error);
      }

      // Fallback to standard endpoint if new one fails

      // Get all products by fetching multiple pages
      let allFetchedProducts: Product[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const pageSize = 100; // Fetch more per page

      while (hasMorePages) {
        const response = await fetch(
          `/api/admin/products?page=${currentPage}&limit=${pageSize}`
        );

        if (!response.ok) {
          break;
        }

        const data = await response.json();
        const products = data.data || [];

        allFetchedProducts = [...allFetchedProducts, ...products];

        // Check if we've received fewer products than the page size, indicating the last page
        if (products.length < pageSize) {
          hasMorePages = false;
        } else {
          currentPage++;
        }
      }

      setAllProducts(allFetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("خطا در بارگذاری محصولات");
    } finally {
      setProductsLoading(false);
    }
  };

  // Refresh branch products when drawer is open
  useEffect(() => {
    let productsIntervalId: NodeJS.Timeout | null = null;

    if (productDrawerVisible && currentBranch) {
      // Set up auto-refresh interval for products (30 seconds)
      productsIntervalId = setInterval(() => {
        setProductsLoading(true);
        fetchBranchProductsRef.current?.(currentBranch.branchid).finally(() => {
          setTimeout(() => setProductsLoading(false), 500); // Show loading for at least 500ms for UX
        });
      }, 30000);
    }

    // Clean up interval when drawer closes or component unmounts
    return () => {
      if (productsIntervalId) {
        clearInterval(productsIntervalId);
      }
    };
  }, [productDrawerVisible, currentBranch]);

  const fetchBranchProducts = async (branchId: number) => {
    try {
      setProductsLoading(true);
      const response = await fetch(`/api/admin/branches/${branchId}/products`);
      if (!response.ok) throw new Error("خطا در دریافت محصولات شعبه");
      const responseData = await response.json();
      
      // Extract products from the data property if it exists
      const productsArray = responseData.data && Array.isArray(responseData.data) 
        ? responseData.data 
        : (Array.isArray(responseData) ? responseData : []);
      
      setProducts(productsArray);
    } catch (error) {
      console.error("Error fetching branch products:", error);
      message.error("خطا در بارگذاری محصولات شعبه");
      // Set empty array in case of error
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Store the fetchBranchProducts function in the ref
  useEffect(() => {
    fetchBranchProductsRef.current = fetchBranchProducts;
  }, []);

  const handleCreateBranch = async (values: any) => {
    try {
      const response = await fetch("/api/admin/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در ایجاد شعبه");
      }

      message.success("شعبه با موفقیت ایجاد شد");
      setModalVisible(false);
      form.resetFields();
      fetchBranches();
    } catch (error: any) {
      console.error("Error creating branch:", error);
      message.error(error.message || "خطا در ایجاد شعبه");
    }
  };

  const handleUpdateBranch = async (values: any) => {
    if (!currentBranch) return;

    try {
      const response = await fetch(
        `/api/admin/branches/${currentBranch.branchid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در بروزرسانی شعبه");
      }

      message.success("شعبه با موفقیت بروزرسانی شد");
      setEditBranchModalVisible(false);
      editForm.resetFields();
      fetchBranches();
    } catch (error: any) {
      console.error("Error updating branch:", error);
      message.error(error.message || "خطا در بروزرسانی شعبه");
    }
  };

  const handleDeleteBranch = async (branchId: number) => {
    try {
      const response = await fetch(`/api/admin/branches/${branchId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("خطا در حذف شعبه");

      message.success("شعبه با موفقیت حذف شد");
      fetchBranches();
    } catch (error) {
      console.error("Error deleting branch:", error);
      message.error("خطا در حذف شعبه");
    }
  };

  const showEditBranchModal = (branch: Branch) => {
    setCurrentBranch(branch);
    setEditBranchModalVisible(true);
  };

  const handleViewProducts = (branch: Branch) => {
    setCurrentBranch(branch);
    fetchBranchProducts(branch.branchid);
    setProductDrawerVisible(true);
  };

  const handleCreateInvoice = (branch: Branch) => {
    setCurrentBranch(branch);
    setInvoiceModalVisible(true);
  };

  const handleAddProduct = async () => {
    if (!currentBranch || !selectedProduct) return;

    try {
      const response = await fetch(
        `/api/admin/branches/${currentBranch.branchid}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: selectedProduct,
            quantity: productQuantity,
          }),
        }
      );

      if (!response.ok) throw new Error("خطا در افزودن محصول");

      message.success("محصول با موفقیت به شعبه اضافه شد");
      productForm.resetFields();
      setSelectedProduct(null);
      setProductQuantity(1);

      // Update branch products
      await fetchBranchProducts(currentBranch.branchid);

      // Refresh all branches to update product counts and totals
      await fetchBranches();
    } catch (error) {
      console.error("Error adding product:", error);
      message.error("خطا در افزودن محصول به شعبه");
    }
  };

  const handleUpdateProductQuantity = async (
    productId: number,
    quantity: number
  ) => {
    if (!currentBranch) return;

    try {
      const response = await fetch(
        `/api/admin/branches/${currentBranch.branchid}/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        }
      );

      if (!response.ok) throw new Error("خطا در بروزرسانی تعداد محصول");

      message.success("تعداد محصول با موفقیت بروزرسانی شد");

      // Update branch products
      await fetchBranchProducts(currentBranch.branchid);

      // Refresh all branches to update product counts and totals
      await fetchBranches();
    } catch (error) {
      console.error("Error updating product quantity:", error);
      message.error("خطا در بروزرسانی تعداد محصول");
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    if (!currentBranch) return;

    try {
      const response = await fetch(
        `/api/admin/branches/${currentBranch.branchid}/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("خطا در حذف محصول");

      message.success("محصول با موفقیت از شعبه حذف شد");

      // Update branch products
      await fetchBranchProducts(currentBranch.branchid);

      // Refresh all branches to update product counts and totals
      await fetchBranches();
    } catch (error) {
      console.error("Error removing product:", error);
      message.error("خطا در حذف محصول از شعبه");
    }
  };

  // Add function to clear search
  const clearSearch = () => {
    setSearchValue("");
    setSearchProductId(null);
    router.push("/admin/branches");
  };

  // Updated handleSearch function and search UI
  const handleSearch = (value: string) => {
    setSearchValue(value);

    if (!value.trim()) {
      // Clear search
      clearSearch();
      return;
    }

    // Try to find an exact match first
    let foundProduct = allProducts.find(
      (product) =>
        product.Type && product.Type.toLowerCase() === value.toLowerCase()
    );

    // If no exact match, try a partial match
    if (!foundProduct) {
      foundProduct = allProducts.find(
        (product) =>
          product.Type &&
          product.Type.toLowerCase().includes(value.toLowerCase())
      );
    }

    if (foundProduct) {
      setSearchProductId(foundProduct.ProductId);
      // Update URL for direct linking to search results
      router.push(`/admin/branches?productId=${foundProduct.ProductId}`);
    } else {
      // If no match found, clear the product ID filter but keep the search text
      setSearchProductId(null);
      router.push("/admin/branches");
    }
  };

  // Update the getSearchOptions function to return more results
  const getSearchOptions = () => {
    if (!allProducts || allProducts.length === 0) return [];

    // If no search value, show all products
    if (!searchValue || searchValue.trim() === "") {
      return allProducts.map((product) => ({
        value: product.Type || "",
        label: (
          <div className="flex justify-between items-center">
            <span className="text-white font-medium">{product.Type}</span>
            <span className="text-blue-300 text-xs bg-blue-900/30 px-2 py-0.5 rounded-md">
              کد: {product.ProductId}
            </span>
          </div>
        ),
      }));
    }

    const lowerCaseSearch = searchValue.toLowerCase();

    // Don't filter too strictly, show any product that contains the search text
    return allProducts
      .filter(
        (product) =>
          product.Type && product.Type.toLowerCase().includes(lowerCaseSearch)
      )
      .map((product) => ({
        value: product.Type,
        label: (
          <div className="flex justify-between items-center">
            <span className="text-white font-medium">{product.Type}</span>
            <span className="text-blue-300 text-xs bg-blue-900/30 px-2 py-0.5 rounded-md">
              کد: {product.ProductId}
            </span>
          </div>
        ),
      }));
  };

  if (initialLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div
      className="bg-gray-950 rounded-lg text-white p-4 sm:p-6 space-y-6"
      style={{ direction: "rtl" }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">مدیریت شعبه‌ها</h1>
          <p className="text-gray-400 text-sm">
            از اینجا می‌توانید شعبه‌ها و محصولات آنها را مدیریت کنید
          </p>
        </div>

        {/* Search and Add Branch Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <AutoComplete
              placeholder="جستجوی محصول در شعبه‌ها..."
              value={searchValue}
              onChange={(value) => {
                setSearchValue(value);
                // Auto-clear search when input is empty
                if (!value.trim()) {
                  clearSearch();
                }
              }}
              onSelect={handleSearch}
              options={getSearchOptions()}
              style={{
                width: "100%",
                direction: "rtl",
              }}
              className="custom-autocomplete w-full"
              popupMatchSelectWidth={false}
              popupClassName="enhanced-dropdown"
              listHeight={400}
              listItemHeight={38}
              showSearch
              filterOption={false}
            >
              <Input
                className="search-input bg-[#1e293b] text-white border-[#384152] hover:border-[#4b5563] pl-12"
                style={{
                  height: "32px",
                  direction: "rtl",
                  textAlign: "right",
                }}
                onPressEnter={() => handleSearch(searchValue)}
              />
            </AutoComplete>
            <Button
              type="primary"
              icon={<SearchOutlined style={{ fontSize: "14px" }} />}
              onClick={() => {
                if (searchValue.trim()) {
                  handleSearch(searchValue);
                } else {
                  // If empty, just ensure we're showing all results
                  clearSearch();
                }
              }}
              className="absolute left-0 top-0 h-full bg-blue-600 hover:bg-blue-700 border-0 rounded-r-none rounded-l-md flex items-center justify-center"
              style={{ width: "40px" }}
            />
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            className="bg-blue-600 hover:bg-blue-700 border-blue-700 w-full sm:w-auto"
          >
            ایجاد شعبه
          </Button>
        </div>
      </div>
      {/* Product Search Summary if search is active */}
      {searchProductId && allProducts.length > 0 && !initialLoading && !loading && (
        <ProductSearchSummary
          productName={
            allProducts.find((p) => p.ProductId === searchProductId)?.Type ||
            "محصول نامشخص"
          }
          productId={searchProductId}
          branches={branches}
          clearSearch={clearSearch}
        />
      )}
      <Tabs
        activeKey={activeTab}
        className="mt-4 branches-tabs"
        onChange={(key) => {
          setActiveTab(key);

          // Show loading message for better UX
          if (key === "warranty-stats") {
            message.info("در حال بارگیری آمار گارانتی‌ها...", 0.5);
          } else if (key === "warranty-requests") {
            message.info("در حال بارگیری درخواست‌های بررسی...", 0.5);
          }
        }}
      >
        <TabPane
          tab={<span className="tab-label">شعبه‌ها</span>}
          key="branches"
        >
          {/* Branches Table */}
          <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
            <BranchTable
              branches={branches}
              loading={loading || refreshing}
              onEdit={showEditBranchModal}
              onDelete={handleDeleteBranch}
              onViewProducts={handleViewProducts}
              onCreateInvoice={handleCreateInvoice}
              isSearching={!!searchProductId}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page, pageSize) => {
                  fetchBranches(page, pageSize || pagination.pageSize);
                },
              }}
            />
          </div>
        </TabPane>

        <TabPane
          tab={<span className="tab-label">آمار گارانتی</span>}
          key="warranty-stats"
        >
          <Card
            title="آمار گارانتی‌ها"
            bordered={false}
            className="bg-gray-800 text-white"
            headStyle={{ color: "white", borderBottom: "1px solid #4b5563" }}
          >
            <p className="text-gray-400 mb-4">
              آمار گارانتی‌های فعال، منقضی شده و درخواست‌های بررسی
            </p>
            <WarrantyStats
              key={`stats-${new Date().getTime()}`}
              isTabActive={activeTab === "warranty-stats"}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={<span className="tab-label">درخواست‌های بررسی</span>}
          key="warranty-requests"
        >
          <Card
            title="درخواست‌های بررسی گارانتی"
            bordered={false}
            className="bg-gray-800 text-white"
            headStyle={{ color: "white", borderBottom: "1px solid #4b5563" }}
          >
            <p className="text-gray-400 mb-4">
              لیست درخواست‌های بررسی گارانتی از تمام شعبه‌ها
            </p>
            <WarrantyRequests
              key={`requests-${new Date().getTime()}`}
              isTabActive={activeTab === "warranty-requests"}
            />
          </Card>
        </TabPane>
      </Tabs>
      {/* Create Branch Modal */}
      <CreateBranchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onFinish={handleCreateBranch}
        form={form}
        users={users}
      />
      {/* Edit Branch Modal */}
      {currentBranch && (
        <EditBranchModal
          visible={editBranchModalVisible}
          onClose={() => setEditBranchModalVisible(false)}
          onFinish={handleUpdateBranch}
          form={editForm}
          branch={currentBranch}
          users={users}
        />
      )}
      {/* Products Drawer */}
      {currentBranch && (
        <ProductDrawer
          visible={productDrawerVisible}
          onClose={() => setProductDrawerVisible(false)}
          branch={currentBranch}
          products={products}
          allProducts={allProducts}
          onAddProduct={handleAddProduct}
          onUpdateQuantity={handleUpdateProductQuantity}
          onRemoveProduct={handleRemoveProduct}
          productForm={productForm}
          loading={productsLoading}
          selectedProduct={selectedProduct}
          onSelectProduct={(productId) => setSelectedProduct(productId)}
          onQuantityChange={(quantity) => setProductQuantity(quantity || 1)}
        />
      )}
      {/* Invoice Modal */}
      {currentBranch && (
        <InvoiceModal
          visible={invoiceModalVisible}
          onClose={() => setInvoiceModalVisible(false)}
          branch={currentBranch}
        />
      )}
      {/* Global Styles */}
      <Styles />
      <style jsx global>{`
        /* Better tabs styling */
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

        /* Add better contrast for tabs - remove old styles */
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

        /* Make scrollbar more visible */
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

        /* RTL search box fixes */
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

        /* Fix hover state - prevent white background */
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

        /* Fix placeholder visibility */
        .ant-select-selection-placeholder {
          color: #cbd5e1 !important;
          opacity: 1 !important;
        }

        /* Search result highlighting styles */
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

        /* Product search tags styling */
        .ant-tag {
          border-radius: 4px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-family: inherit !important;
        }

        /* RTL-specific styles */
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
          direction: ltr;
        }

        .rtl-table .ant-pagination-prev {
          transform: rotate(180deg);
        }

        .rtl-table .ant-pagination-next {
          transform: rotate(180deg);
        }

        .ant-drawer-header-title {
          flex-direction: row-reverse;
        }

        .ant-drawer-header .ant-drawer-close {
          margin-right: 0;
          margin-left: 12px;
        }

        /* RTL modal fixes */
        .ant-modal-title {
          text-align: right;
        }

        .ant-modal-close {
          right: auto;
          left: 17px;
        }

        .ant-form-item-label {
          text-align: right;
        }

        .ant-alert-message {
          text-align: right;
        }

        .custom-autocomplete .ant-select-selection-search {
          right: 0;
          left: auto;
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
