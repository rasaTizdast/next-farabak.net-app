"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Form, Spin, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Branch, User, Product } from "./components/types";
import BranchTable from "./components/BranchTable";
import CreateBranchModal from "./components/CreateBranchModal";
import EditBranchModal from "./components/EditBranchModal";
import ProductDrawer from "./components/ProductDrawer";
import LoadingSkeleton from "./components/LoadingSkeleton";
import Styles from "./components/Styles";

export default function BranchesPage() {
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
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [productForm] = Form.useForm();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [productsLoading, setProductsLoading] = useState(false);
  const router = useRouter();

  // Create refs for the fetch functions to use in intervals
  const fetchBranchesRef = useRef<() => Promise<void>>();
  const fetchBranchProductsRef = useRef<(branchId: number) => Promise<void>>();

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
      console.log("Auto-refreshing branches data...");
      setRefreshing(true);
      fetchBranchesRef.current?.()
        .finally(() => {
          setTimeout(() => setRefreshing(false), 500); // Show loading for at least 500ms for UX
        });
    }, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/branches");
      if (!response.ok) throw new Error("خطا در دریافت شعبه‌ها");
      const data = await response.json();

      // No need to calculate totalQuantity anymore as it comes from the API
      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
      message.error("خطا در بارگذاری شعبه‌ها");
    } finally {
      setLoading(false);
    }
  };

  // Store the fetchBranches function in the ref to use in the interval
  useEffect(() => {
    fetchBranchesRef.current = fetchBranches;
  }, []);

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
      const response = await fetch("/api/admin/products");
      if (!response.ok) throw new Error("خطا در دریافت محصولات");
      const responseData = await response.json();

      // Extract the data array from the response
      const products = responseData.data || [];
      setAllProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("خطا در بارگذاری محصولات");
    }
  };

  // Refresh branch products when drawer is open
  useEffect(() => {
    let productsIntervalId: NodeJS.Timeout | null = null;
    
    if (productDrawerVisible && currentBranch) {
      // Set up auto-refresh interval for products (30 seconds)
      productsIntervalId = setInterval(() => {
        console.log(`Auto-refreshing products for branch ${currentBranch.name}...`);
        setProductsLoading(true);
        fetchBranchProductsRef.current?.(currentBranch.branchid)
          .finally(() => {
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
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching branch products:", error);
      message.error("خطا در بارگذاری محصولات شعبه");
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

  if (initialLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">مدیریت شعبه‌ها</h1>
        <div className="flex items-center">
          {refreshing && (
            <div className="flex items-center text-blue-400 ml-4">
              <Spin size="small" className="mr-2" />
              <span>در حال بروزرسانی...</span>
            </div>
          )}
          <Button
            type="primary"
            onClick={() => setModalVisible(true)}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 border-blue-700"
          >
            ساخت شعبه جدید
            <PlusOutlined />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden p-6">
          <div className="flex justify-center my-8">
            <Spin size="large" />
          </div>
        </div>
      ) : (
        <BranchTable
          branches={branches}
          loading={loading}
          onEdit={showEditBranchModal}
          onDelete={handleDeleteBranch}
          onViewProducts={handleViewProducts}
        />
      )}

      {/* Create Branch Modal */}
      <CreateBranchModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onFinish={handleCreateBranch}
        users={users}
      />

      {/* Edit Branch Modal */}
      <EditBranchModal
        visible={editBranchModalVisible}
        onCancel={() => setEditBranchModalVisible(false)}
        onFinish={handleUpdateBranch}
        branch={currentBranch}
      />

      {/* Products Drawer */}
      <ProductDrawer
        visible={productDrawerVisible}
        onClose={() => setProductDrawerVisible(false)}
        branch={currentBranch}
        products={products}
        allProducts={allProducts}
        productsLoading={productsLoading}
        form={productForm}
        selectedProduct={selectedProduct}
        onSelectProduct={setSelectedProduct}
        onQuantityChange={(value) => value !== null && setProductQuantity(value)}
        onAddProduct={handleAddProduct}
        onUpdateQuantity={handleUpdateProductQuantity}
        onRemoveProduct={handleRemoveProduct}
      />

      {/* Global Styles */}
      <Styles />
    </div>
  );
}
