"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  Empty,
  Spin,
  Button,
  Table,
  InputNumber,
  message,
  Popconfirm,
  Alert,
  Form,
} from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Branch, Product } from "../components/types";
import { toPersianDate } from "../components/types";
import { useSearchParams, useRouter } from "next/navigation";
import ProductDrawer from "../components/ProductDrawer";
import InvoiceModal from "../components/invoice/InvoiceModal";
import Styles from "../components/Styles";

export default function MyBranchPage() {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [productDrawerVisible, setProductDrawerVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [productForm] = Form.useForm();

  const isUnauthorized = searchParams.get("unauthorized") === "true";
  const attemptedPath = searchParams.get("attempted");

  // Store the current branch ID in a ref to use in intervals
  const currentBranchIdRef = useRef<number | null>(null);

  // Define all fetch functions first
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

  // Create a ref for fetchBranchProducts to use in intervals
  const fetchBranchProductsRef = useRef(fetchBranchProducts);
  useEffect(() => {
    fetchBranchProductsRef.current = fetchBranchProducts;
  }, []);

  // Update the branch ID ref when branch changes
  useEffect(() => {
    if (branch) {
      currentBranchIdRef.current = branch.branchid;
    }
  }, [branch]);

  // Refresh branch products when product drawer is open
  useEffect(() => {
    let productsIntervalId: NodeJS.Timeout | null = null;

    if (productDrawerVisible && branch) {
      // Set up auto-refresh interval for products (30 seconds)
      productsIntervalId = setInterval(() => {
        console.log(
          `Auto-refreshing products for open drawer (branch ${branch.name})...`
        );
        setProductsLoading(true);
        fetchBranchProductsRef.current(branch.branchid).finally(() => {
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
  }, [productDrawerVisible, branch]);

  // Initial data fetch and auto-refresh
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch the current user's branch
        const response = await fetch("/api/admin/branches/my");

        if (!response.ok) {
          if (response.status === 404) {
            setError(
              "شما هنوز به عنوان شعبه تعریف نشده‌اید. لطفاً با مدیر سایت تماس بگیرید."
            );
            setLoading(false);
            return;
          }

          if (response.status === 401) {
            setAuthError(true);
            setError("دسترسی غیرمجاز - لطفا وارد حساب کاربری خود شوید.");
            setLoading(false);
            return;
          }

          throw new Error("خطا در دریافت اطلاعات شعبه");
        }

        const branchData = await response.json();
        setBranch(branchData);

        // Fetch branch products
        await fetchBranchProducts(branchData.branchid);

        // Fetch all products for the product drawer
        await fetchAllProducts();
      } catch (error) {
        console.error("Error fetching branch data:", error);
        setError("خطا در بارگذاری اطلاعات شعبه");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up auto-refresh interval (30 seconds)
    const intervalId = setInterval(async () => {
      try {
        console.log("Auto-refreshing branch data...");
        setRefreshing(true);

        // Fetch branch data
        const response = await fetch("/api/admin/branches/my");
        if (response.ok) {
          const branchData = await response.json();
          setBranch(branchData);

          // Fetch products for the current branch
          if (branchData && branchData.branchid) {
            console.log(
              `Auto-refreshing products for branch ${branchData.name}...`
            );
            await fetchBranchProductsRef.current(branchData.branchid);
          }
        } else {
          console.error("Failed to refresh branch data:", response.status);
        }
      } catch (error) {
        console.error("Error auto-refreshing branch data:", error);
      } finally {
        setRefreshing(false);
      }
    }, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleAddProduct = async () => {
    if (!branch || !selectedProduct) return;

    try {
      const response = await fetch(
        `/api/admin/branches/${branch.branchid}/products`,
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
      await fetchBranchProducts(branch.branchid);

      // Refresh branch data to update product counts and totals
      const branchResponse = await fetch("/api/admin/branches/my");
      if (branchResponse.ok) {
        const branchData = await branchResponse.json();
        setBranch(branchData);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      message.error("خطا در افزودن محصول به شعبه");
    }
  };

  const handleUpdateProductQuantity = async (
    productId: number,
    quantity: number
  ) => {
    if (!branch) return;

    try {
      const response = await fetch(
        `/api/admin/branches/${branch.branchid}/products/${productId}`,
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
      await fetchBranchProducts(branch.branchid);

      // Refresh branch data to update product counts and totals
      const branchResponse = await fetch("/api/admin/branches/my");
      if (branchResponse.ok) {
        const branchData = await branchResponse.json();
        setBranch(branchData);
      }
    } catch (error) {
      console.error("Error updating product quantity:", error);
      message.error("خطا در بروزرسانی تعداد محصول");
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    if (!branch) return;

    try {
      const response = await fetch(
        `/api/admin/branches/${branch.branchid}/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("خطا در حذف محصول");

      message.success("محصول با موفقیت از شعبه حذف شد");

      // Update branch products
      await fetchBranchProducts(branch.branchid);

      // Refresh branch data to update product counts and totals
      const branchResponse = await fetch("/api/admin/branches/my");
      if (branchResponse.ok) {
        const branchData = await branchResponse.json();
        setBranch(branchData);
      }
    } catch (error) {
      console.error("Error removing product:", error);
      message.error("خطا در حذف محصول از شعبه");
    }
  };

  // Add function to handle invoice creation
  const handleCreateInvoice = () => {
    setInvoiceModalVisible(true);
  };

  const productColumns = [
    {
      title: "نام محصول",
      dataIndex: "Type",
      key: "Type",
      width: "60%",
    },
    {
      title: "تعداد",
      dataIndex: "quantity",
      key: "quantity",
      width: "20%",
      render: (quantity: number, record: Product) => (
        <InputNumber
          min={0}
          defaultValue={quantity}
          onChange={(value) => {
            if (value !== null) {
              handleUpdateProductQuantity(record.ProductId, value);
            }
          }}
          className="w-20 dark-input-number"
          style={{
            backgroundColor: "#374151",
            borderColor: "#4b5563",
            color: "#e5e7eb",
          }}
        />
      ),
    },
    {
      title: "عملیات",
      key: "actions",
      width: "20%",
      render: (_: any, product: Product) => (
        <Popconfirm
          title="حذف محصول"
          description="آیا از حذف این محصول از شعبه اطمینان دارید؟"
          onConfirm={() => handleRemoveProduct(product.ProductId)}
          okText="بله"
          cancelText="خیر"
          okButtonProps={{ className: "bg-red-600 hover:bg-red-700" }}
        >
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            className="!bg-red-500 !text-white !border-none hover:!bg-red-600"
          >
            حذف
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-gray-800 rounded-lg shadow-md overflow-hidden text-white">
          <div className="flex flex-col items-center justify-center py-8">
            <ExclamationCircleOutlined
              style={{ fontSize: 48, color: "#f5222d", marginBottom: 16 }}
            />
            <h1 className="text-xl font-bold text-center">{error}</h1>
            {authError ? (
              <div className="mt-4 text-center">
                <p className="text-gray-300 mb-4">
                  ممکن است نشست کاری شما منقضی شده باشد. لطفاً دوباره وارد شوید.
                </p>
                <Button
                  type="primary"
                  onClick={() => router.push("/auth/login")}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  ورود مجدد
                </Button>
              </div>
            ) : (
              <p className="text-gray-300 mt-4 text-center">
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
        <Card className="bg-gray-800 rounded-lg shadow-md overflow-hidden text-white">
          <Empty
            description="اطلاعات شعبه در دسترس نیست"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="text-gray-400"
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Unauthorized Message Alert */}
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

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">مدیریت شعبه من</h1>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {refreshing && (
            <div className="flex items-center text-blue-400 ml-4">
              <Spin size="small" className="mr-2" />
              <span>در حال بروزرسانی...</span>
            </div>
          )}
          {/* Add invoice button */}
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={handleCreateInvoice}
            className="bg-green-600 hover:bg-green-700 mr-2"
          >
            ثبت فاکتور جدید
          </Button>
        </div>
      </div>

      {/* Branch details card */}
      <Card
        title="اطلاعات شعبه"
        className="bg-gray-800 mb-6 rounded-lg shadow-md overflow-hidden text-white"
        headStyle={{
          backgroundColor: "#1f2937",
          borderBottom: "1px solid #374151",
          color: "#f3f4f6",
        }}
        bodyStyle={{ backgroundColor: "#1f2937" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">نام شعبه:</p>
            <p className="text-xl font-medium">{branch.name}</p>
          </div>
          <div>
            <p className="text-gray-400">کد شعبه:</p>
            <p className="text-xl font-medium">{branch.location}</p>
          </div>
          <div>
            <p className="text-gray-400">تاریخ ایجاد:</p>
            <p className="text-xl font-medium">
              {toPersianDate(branch.createdat)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">تعداد محصولات:</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-medium">
                {branch.productCount} نوع محصول
              </span>
              <span className="bg-blue-800/70 text-blue-100 px-2 py-0.5 rounded-md text-sm">
                {branch.totalQuantity} عدد
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Products table */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>محصولات شعبه</span>
            <Button
              type="primary"
              onClick={() => setProductDrawerVisible(true)}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 border-blue-700"
            >
              افزودن محصول
              <PlusOutlined />
            </Button>
          </div>
        }
        className="bg-gray-800 rounded-lg shadow-md overflow-hidden text-white"
        headStyle={{
          backgroundColor: "#1f2937",
          borderBottom: "1px solid #374151",
          color: "#f3f4f6",
        }}
        bodyStyle={{ backgroundColor: "#1f2937" }}
      >
        {productsLoading ? (
          <div className="flex justify-center my-8">
            <Spin />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              columns={productColumns}
              dataSource={products}
              rowKey="ProductId"
              pagination={{ pageSize: 10 }}
              className="dark-table"
              locale={{
                emptyText: (
                  <Empty
                    description="هیچ محصولی برای این شعبه یافت نشد"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="text-gray-400"
                  />
                ),
              }}
            />
          </div>
        )}
      </Card>

      {/* Add InvoiceModal */}
      {branch && (
        <InvoiceModal
          visible={invoiceModalVisible}
          onClose={() => setInvoiceModalVisible(false)}
          branch={branch}
        />
      )}

      <ProductDrawer
        visible={productDrawerVisible}
        onClose={() => setProductDrawerVisible(false)}
        branch={branch}
        products={products}
        allProducts={allProducts}
        productsLoading={productsLoading}
        form={productForm}
        selectedProduct={selectedProduct}
        onSelectProduct={setSelectedProduct}
        onQuantityChange={(value) =>
          value !== null && setProductQuantity(value)
        }
        onAddProduct={handleAddProduct}
        onUpdateQuantity={handleUpdateProductQuantity}
        onRemoveProduct={handleRemoveProduct}
      />

      {/* Global Styles */}
      <Styles />
    </div>
  );
}
