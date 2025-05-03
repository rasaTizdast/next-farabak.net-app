"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
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
  Tabs,
  Badge,
  Tag,
  Input,
  AutoComplete,
} from "antd";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Branch, Product } from "../components/types";
import { toPersianDate } from "../components/types";
import { useSearchParams, useRouter } from "next/navigation";
import ProductDrawer from "../components/ProductDrawer";
import InvoiceModal from "../components/invoice/InvoiceModal";
import Styles from "../components/Styles";
import { AdminInvoice } from "@/app/admin/invoices/type";
import BranchInvoiceDetailsModal from "./invoices/components/BranchInvoiceDetailsModal";
import BranchWarrantyViewModal from "./invoices/components/BranchWarrantyViewModal";
import moment from "jalali-moment";
import SkeletonLoading from "./components/SkeletonLoading";
import WarrantyStats from "./components/WarrantyStats";
import WarrantyRequests from "../components/WarrantyRequests";

function MyBranchContent() {
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

  // Added for invoices section
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<AdminInvoice[]>([]);
  const [standaloneWarranties, setStandaloneWarranties] = useState<any[]>([]);
  const [filteredStandaloneWarranties, setFilteredStandaloneWarranties] =
    useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchOptions, setSearchOptions] = useState<
    { value: string; label: React.ReactNode }[]
  >([]);
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(
    null
  );
  const [selectedStandaloneWarranty, setSelectedStandaloneWarranty] = useState<
    any | null
  >(null);
  const [warrantySummary, setWarrantySummary] = useState<{
    active: number;
    expired: number;
  }>({ active: 0, expired: 0 });
  const [activeTab, setActiveTab] = useState("products");

  // Add debounce state and refs for product quantity updates
  const [debouncedQuantities, setDebouncedQuantities] = useState<{
    [key: number]: number;
  }>({});
  const quantityTimersRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  // Initialize debounced quantities when products change
  useEffect(() => {
    const initialValues: { [key: number]: number } = {};
    if (products && Array.isArray(products)) {
      products.forEach((product) => {
        initialValues[product.ProductId] = product.quantity;
      });
    }
    setDebouncedQuantities(initialValues);
  }, [products]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(quantityTimersRef.current).forEach((timer) =>
        clearTimeout(timer)
      );
    };
  }, []);

  const isUnauthorized = searchParams.get("unauthorized") === "true";
  const attemptedPath = searchParams.get("attempted");

  // Store the current branch ID in a ref to use in intervals
  const currentBranchIdRef = useRef<number | null>(null);

  // Add product pagination state
  const [productPagination, setProductPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Add invoices pagination state
  const [invoicePagination, setInvoicePagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Define all fetch functions first
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

  // Update the fetchBranchProducts function to use pagination
  const fetchBranchProducts = async (
    branchId: number,
    page: number = productPagination.current,
    pageSize: number = productPagination.pageSize
  ) => {
    try {
      setProductsLoading(true);
      const response = await fetch(
        `/api/admin/branches/${branchId}/products?page=${page}&limit=${pageSize}`
      );
      if (!response.ok) throw new Error("خطا در دریافت محصولات شعبه");
      const responseData = await response.json();

      // Check if response is an array (new API format) or has pagination (old format)
      if (Array.isArray(responseData)) {
        // New API format - direct array of products
        setProducts(responseData);
        setProductPagination({
          ...productPagination, // Maintain current pagination state
          total: responseData.length, // Set total to array length
        });
      } else if (responseData.data) {
        // Old API format with pagination object
        setProducts(responseData.data);
        setProductPagination({
          current: responseData.pagination.currentPage,
          pageSize: pageSize,
          total: responseData.pagination.totalCount,
        });
      } else {
        // Fallback case
        setProducts([]);
        setProductPagination({
          ...productPagination,
          total: 0,
        });
      }
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

  // Update the fetchInvoices function to use pagination
  const fetchInvoices = async (
    page: number = invoicePagination.current,
    pageSize: number = invoicePagination.pageSize
  ) => {
    if (!branch) return;

    try {
      setInvoicesLoading(true);
      const response = await fetch(
        `/api/admin/branches/my/invoices?page=${page}&limit=${pageSize}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();
      if (data.invoices) {
        setInvoices(data.invoices);
        setFilteredInvoices(data.invoices);

        // Handle standalone warranties
        if (data.standaloneWarranties) {
          setStandaloneWarranties(data.standaloneWarranties);
          setFilteredStandaloneWarranties(data.standaloneWarranties);
        } else {
          setStandaloneWarranties([]);
          setFilteredStandaloneWarranties([]);
        }

        if (data.warrantySummary) {
          setWarrantySummary(data.warrantySummary);
        }

        // Update pagination if available
        if (data.pagination) {
          setInvoicePagination({
            current: data.pagination.currentPage,
            pageSize: pageSize,
            total: data.pagination.totalCount,
          });
        }
      } else {
        // Handle case where response doesn't have expected structure
        setInvoices([]);
        setFilteredInvoices([]);
        setStandaloneWarranties([]);
        setFilteredStandaloneWarranties([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      message.error("خطا در بارگذاری فاکتورها");
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Enhanced date formatting function with better error handling
  const formatDate = (dateString: any) => {
    if (!dateString) return "-";

    // Log the incoming date string for debugging
    console.log("Formatting date:", dateString, typeof dateString);

    try {
      // For non-string dates, convert to string format
      if (typeof dateString === "object") {
        if (dateString instanceof Date) {
          return moment(dateString).format("YYYY/MM/DD | HH:mm:ss");
        }
      }

      // Handle numeric timestamps
      if (typeof dateString === "number") {
        return moment(new Date(dateString)).format("YYYY/MM/DD | HH:mm:ss");
      }

      // Ensure we're working with a string
      const dateStr = String(dateString);

      // For ISO date strings like "2023-05-15T10:30:00.000Z"
      if (dateStr.includes("T") && dateStr.includes("Z")) {
        return moment(dateStr).format("YYYY/MM/DD | HH:mm:ss");
      }

      // For YYYY-MM-DD format
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return moment(dateStr, "YYYY-MM-DD").format("YYYY/MM/DD");
      }

      // For DD/MM/YYYY format
      if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return moment(dateStr, "DD/MM/YYYY").format("YYYY/MM/DD");
      }

      // For already formatted dates like "YYYY/MM/DD | HH:mm:ss"
      if (dateStr.match(/^\d{4}\/\d{2}\/\d{2} \| \d{2}:\d{2}:\d{2}$/)) {
        return dateStr; // Already formatted correctly
      }

      // Default parsing as last resort
      const formattedDate = moment(dateStr).format("YYYY/MM/DD | HH:mm:ss");

      if (formattedDate === "Invalid date") {
        console.error("Failed to parse date:", dateStr);
        return dateStr; // Return original if we can't parse it
      }

      return formattedDate;
    } catch (e) {
      console.error("Error formatting date:", e, typeof dateString, dateString);
      // Return a standardized format for invalid dates
      return String(dateString);
    }
  };

  // Update search options for invoices and standalone warranties
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchOptions([]);
      return;
    }

    const lowerCaseSearch = searchText.toLowerCase();
    const options: { value: string; label: React.ReactNode }[] = [];

    // Add options from invoices
    if (invoices && Array.isArray(invoices) && invoices.length) {
      // Add invoice numbers
      invoices.forEach((invoice) => {
        if (invoice.FactorGuid.toLowerCase().includes(lowerCaseSearch)) {
          options.push({
            value: invoice.FactorGuid,
            label: (
              <div>
                <span className="text-blue-500 font-bold">شماره فاکتور: </span>
                {invoice.FactorGuid}
              </div>
            ),
          });
        }
      });

      // Add customer names
      invoices.forEach((invoice) => {
        if (invoice.Fullname.toLowerCase().includes(lowerCaseSearch)) {
          options.push({
            value: invoice.Fullname,
            label: (
              <div>
                <span className="text-green-500 font-bold">نام مشتری: </span>
                {invoice.Fullname}
              </div>
            ),
          });
        }
      });

      // Add phone numbers
      invoices.forEach((invoice) => {
        if (
          invoice.Phonenumber &&
          invoice.Phonenumber.includes(lowerCaseSearch)
        ) {
          options.push({
            value: invoice.Phonenumber,
            label: (
              <div>
                <span className="text-purple-500 font-bold">شماره تماس: </span>
                {invoice.Phonenumber}
              </div>
            ),
          });
        }
      });

      // Add warranty codes from invoices
      invoices.forEach((invoice) => {
        if (invoice.Invoice_Details && Array.isArray(invoice.Invoice_Details)) {
          invoice.Invoice_Details.forEach((detail) => {
            if (
              detail.warranty &&
              detail.warranty.warrantycode &&
              detail.warranty.warrantycode
                .toLowerCase()
                .includes(lowerCaseSearch)
            ) {
              options.push({
                value: detail.warranty.warrantycode,
                label: (
                  <div>
                    <span className="text-yellow-500 font-bold">
                      کد گارانتی:{" "}
                    </span>
                    {detail.warranty.warrantycode}
                    <span className="mr-2">
                      {detail.warranty.status === "Expired" ||
                      detail.warranty.displayStatus === "Expired" ? (
                        <Tag color="red" className="mr-2">
                          منقضی شده
                        </Tag>
                      ) : (
                        <Tag color="green" className="mr-2">
                          فعال
                        </Tag>
                      )}
                    </span>
                  </div>
                ),
              });
            }
          });
        }
      });
    }

    // Add standalone warranty codes
    if (
      standaloneWarranties &&
      Array.isArray(standaloneWarranties) &&
      standaloneWarranties.length
    ) {
      standaloneWarranties.forEach((warranty) => {
        if (
          warranty.warrantycode &&
          warranty.warrantycode.toLowerCase().includes(lowerCaseSearch)
        ) {
          options.push({
            value: warranty.warrantycode,
            label: (
              <div>
                <span className="text-orange-500 font-bold">
                  کد گارانتی مستقل:{" "}
                </span>
                {warranty.warrantycode}
                <span className="mr-2">
                  {warranty.status === "Expired" ||
                  warranty.displayStatus === "Expired" ? (
                    <Tag color="red" className="mr-2">
                      منقضی شده
                    </Tag>
                  ) : (
                    <Tag color="green" className="mr-2">
                      فعال
                    </Tag>
                  )}
                </span>
              </div>
            ),
          });
        }

        // Add product names from standalone warranties
        if (
          warranty.Type &&
          warranty.Type.toLowerCase().includes(lowerCaseSearch)
        ) {
          options.push({
            value: warranty.Type,
            label: (
              <div>
                <span className="text-cyan-500 font-bold">
                  محصول با گارانتی مستقل:{" "}
                </span>
                {warranty.Type}
              </div>
            ),
          });
        }
      });
    }

    setSearchOptions(options);
  }, [searchText, invoices, standaloneWarranties]);

  // Filter invoices and standalone warranties based on search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredInvoices(invoices);
      setFilteredStandaloneWarranties(standaloneWarranties);
      return;
    }

    const lowerCaseSearch = searchText.toLowerCase();

    // Search in invoice number, customer name, phone number, or warranty code
    const filteredInvoicesResult = invoices.filter(
      (invoice) =>
        invoice.FactorGuid.toLowerCase().includes(lowerCaseSearch) ||
        invoice.Fullname.toLowerCase().includes(lowerCaseSearch) ||
        (invoice.Phonenumber &&
          invoice.Phonenumber.includes(lowerCaseSearch)) ||
        // Search in warranty codes
        (invoice.Invoice_Details &&
          invoice.Invoice_Details.some(
            (detail) =>
              detail.warranty &&
              detail.warranty.warrantycode &&
              detail.warranty.warrantycode
                .toLowerCase()
                .includes(lowerCaseSearch)
          ))
    );

    setFilteredInvoices(filteredInvoicesResult);

    // Filter standalone warranties
    const filteredWarrantiesResult = standaloneWarranties.filter(
      (warranty) =>
        (warranty.warrantycode &&
          warranty.warrantycode.toLowerCase().includes(lowerCaseSearch)) ||
        (warranty.Type && warranty.Type.toLowerCase().includes(lowerCaseSearch))
    );

    setFilteredStandaloneWarranties(filteredWarrantiesResult);
  }, [searchText, invoices, standaloneWarranties]);

  // Function to get warranty status summary for an invoice
  const getWarrantyStatusSummary = (invoice: AdminInvoice) => {
    if (!invoice.Invoice_Details || !Array.isArray(invoice.Invoice_Details)) {
      return null;
    }

    const hasWarranties = invoice.Invoice_Details.some(
      (detail) => detail.warranty
    );
    if (!hasWarranties) {
      return null;
    }

    const activeWarranties = invoice.Invoice_Details.filter(
      (detail) =>
        detail.warranty &&
        detail.warranty.status !== "Expired" &&
        detail.warranty.displayStatus !== "Expired"
    ).length;

    const expiredWarranties = invoice.Invoice_Details.filter(
      (detail) =>
        detail.warranty &&
        (detail.warranty.status === "Expired" ||
          detail.warranty.displayStatus === "Expired")
    ).length;

    return { active: activeWarranties, expired: expiredWarranties };
  };

  // Update the fetchInitialData function to also get invoices
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

        // Fetch branch invoices
        await fetchInvoices();

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
        setRefreshing(true);

        // Fetch branch data
        const response = await fetch("/api/admin/branches/my");
        if (response.ok) {
          const branchData = await response.json();
          setBranch(branchData);

          // Fetch products for the current branch
          if (branchData && branchData.branchid) {
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

  // Add effect to load invoices when switching to the invoices tab
  useEffect(() => {
    if (activeTab === "invoices") {
      fetchInvoices();
    }
  }, [activeTab]);

  const handleTabChange = (newActiveTab: string) => {
    setActiveTab(newActiveTab);
  };

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

  // Create a debounced version of handleUpdateProductQuantity
  const handleDebouncedQuantityChange = (productId: number, value: number) => {
    // Clear existing timer for this product
    if (quantityTimersRef.current[productId]) {
      clearTimeout(quantityTimersRef.current[productId]);
    }

    // Update local state immediately for UI
    setDebouncedQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));

    // Set a new timer for this product
    quantityTimersRef.current[productId] = setTimeout(() => {
      handleUpdateProductQuantity(productId, value);
    }, 2000); // 2 second delay
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

  // Add function to handle invoice creation
  const handleCreateInvoice = () => {
    setInvoiceModalVisible(true);
  };

  // Add function for invoice creation success
  const handleInvoiceCreationSuccess = () => {
    // Close the modal
    setInvoiceModalVisible(false);

    // Refresh invoices list
    fetchInvoices();

    // Show success message
    message.success("فاکتور با موفقیت ایجاد شد");
  };

  // Add function to update invoice status
  const updateInvoiceStatus = async (
    invoice: AdminInvoice,
    checked: boolean
  ) => {
    try {
      const response = await fetch(
        `/api/admin/invoices?id=${invoice.Invoiceid}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checked: checked,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("خطا در بروزرسانی وضعیت فاکتور");
      }

      // Update the invoice in state
      const updatedInvoices = invoices.map((inv) => {
        if (inv.Invoiceid === invoice.Invoiceid) {
          return { ...inv, Checked: checked };
        }
        return inv;
      });

      setInvoices(updatedInvoices);
      setFilteredInvoices(
        filteredInvoices.map((inv) => {
          if (inv.Invoiceid === invoice.Invoiceid) {
            return { ...inv, Checked: checked };
          }
          return inv;
        })
      );

      message.success("وضعیت فاکتور با موفقیت بروزرسانی شد");
    } catch (error) {
      console.error("Error updating invoice status:", error);
      message.error("خطا در بروزرسانی وضعیت فاکتور");
    }
  };

  // Add a handler for invoice table pagination change
  const handleInvoiceTableChange = (pagination: any) => {
    fetchInvoices(pagination.current, pagination.pageSize);
  };

  const productColumns = [
    {
      title: "نام محصول",
      dataIndex: "Type",
      key: "Type",
      width: "60%",
      className: "text-right",
    },
    {
      title: "تعداد",
      dataIndex: "quantity",
      key: "quantity",
      width: "40%",
      className: "text-center",
      render: (quantity: number, record: Product) => (
        <InputNumber
          min={0}
          value={debouncedQuantities[record.ProductId] ?? record.quantity}
          onChange={(value) => {
            if (value !== null) {
              handleDebouncedQuantityChange(record.ProductId, value);
            }
          }}
          onBlur={() => {
            // Update immediately on blur
            if (quantityTimersRef.current[record.ProductId]) {
              clearTimeout(quantityTimersRef.current[record.ProductId]);
              handleUpdateProductQuantity(
                record.ProductId,
                debouncedQuantities[record.ProductId]
              );
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
  ];

  // Define invoice columns with useMemo
  const memoizedInvoiceColumns = useMemo(
    () => [
      {
        title: "شماره فاکتور",
        dataIndex: "FactorGuid",
        key: "FactorGuid",
        className: "text-right font-medium",
        render: (text: string) => (
          <span className="text-blue-400 font-medium">{text}</span>
        ),
      },
      {
        title: "نام مشتری",
        dataIndex: "Fullname",
        key: "Fullname",
        className: "text-right font-medium",
        render: (text: string) => <span className="text-gray-100">{text}</span>,
      },
      {
        title: "شماره تماس",
        dataIndex: "Phonenumber",
        key: "Phonenumber",
        className: "text-right font-medium",
        render: (phone: string) => (
          <a
            href={`tel:${phone}`}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {phone}
          </a>
        ),
      },
      {
        title: "تاریخ",
        dataIndex: "Date",
        key: "Date",
        className: "text-right font-medium",
        render: (date: string) => (
          <span className="text-gray-200">{formatDate(date)}</span>
        ),
      },
      {
        title: "وضعیت",
        dataIndex: "Checked",
        key: "Checked",
        className: "text-right font-medium",
        render: (checked: boolean, invoice: AdminInvoice) => (
          <div className="flex items-center justify-center">
            {checked ? (
              <Tag
                color="success"
                className="cursor-pointer flex items-center justify-center px-4 py-1.5 min-w-[120px]"
                onClick={() => updateInvoiceStatus(invoice, false)}
                style={{ fontFamily: "inherit", fontWeight: 500 }}
              >
                <span>بررسی شده</span>
              </Tag>
            ) : (
              <Tag
                color="warning"
                className="cursor-pointer flex items-center justify-center px-4 py-1.5 min-w-[120px]"
                onClick={() => updateInvoiceStatus(invoice, true)}
                style={{
                  fontFamily: "inherit",
                  fontWeight: 500,
                  color: "#000",
                }}
              >
                <span>در انتظار بررسی</span>
              </Tag>
            )}
          </div>
        ),
      },
      {
        title: "وضعیت گارانتی",
        key: "warranty",
        className: "text-center font-medium",
        render: (_: any, invoice: AdminInvoice) => {
          const status = getWarrantyStatusSummary(invoice);
          if (!status) {
            return (
              <Tag
                color="default"
                className="px-4 py-1.5 flex items-center justify-center min-w-[120px]"
                style={{ fontFamily: "inherit", fontWeight: 500 }}
              >
                <span>بدون گارانتی</span>
              </Tag>
            );
          }

          return (
            <div className="flex flex-wrap gap-2 justify-center">
              {status.active > 0 && (
                <Tag
                  color="success"
                  className="px-4 py-1.5 flex items-center justify-center min-w-[120px]"
                  style={{ fontFamily: "inherit", fontWeight: 500 }}
                >
                  <span>{status.active} گارانتی فعال</span>
                </Tag>
              )}
              {status.expired > 0 && (
                <Tag
                  color="error"
                  className="px-4 py-1.5 flex items-center justify-center min-w-[120px]"
                  style={{ fontFamily: "inherit", fontWeight: 500 }}
                >
                  <span>{status.expired} گارانتی منقضی</span>
                </Tag>
              )}
            </div>
          );
        },
      },
      {
        title: "عملیات",
        key: "actions",
        className: "text-center font-medium",
        render: (_: any, invoice: AdminInvoice) => (
          <Button
            type="primary"
            className="bg-blue-600 hover:bg-blue-700 border-blue-700 flex items-center"
            onClick={() => setSelectedInvoice(invoice)}
          >
            <span>مشاهده جزئیات</span>
            <EyeOutlined className="mr-2" />
          </Button>
        ),
      },
    ],
    [updateInvoiceStatus]
  );

  if (loading) {
    return <SkeletonLoading />;
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
        <div className="flex items-center gap-3">
          {refreshing && (
            <div className="flex items-center text-blue-400">
              <Spin size="small" className="ml-2" />
              <span>در حال بروزرسانی...</span>
            </div>
          )}
        </div>
      </div>

      {/* Branch details card */}
      <Card
        title={<span className="text-lg">اطلاعات شعبه</span>}
        className="bg-gray-800 mb-6 rounded-lg shadow-md overflow-hidden text-white"
        headStyle={{
          backgroundColor: "#1f2937",
          borderBottom: "1px solid #374151",
          color: "#f3f4f6",
          padding: "12px 16px",
        }}
        bodyStyle={{ backgroundColor: "#1f2937", padding: "16px" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-2 bg-gray-900/30 rounded">
            <p className="text-gray-400 text-sm mb-1">نام شعبه:</p>
            <p className="text-lg font-medium">{branch.name}</p>
          </div>
          <div className="p-2 bg-gray-900/30 rounded">
            <p className="text-gray-400 text-sm mb-1">کد شعبه:</p>
            <p className="text-lg font-medium">{branch.location}</p>
          </div>
          <div className="p-2 bg-gray-900/30 rounded">
            <p className="text-gray-400 text-sm mb-1">تاریخ ایجاد:</p>
            <p className="text-lg font-medium">
              {toPersianDate(branch.createdat)}
            </p>
          </div>
          <div className="p-2 bg-gray-900/30 rounded">
            <p className="text-gray-400 text-sm mb-1">تعداد محصولات:</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">
                {branch.productCount} نوع محصول
              </span>
              <span className="bg-blue-800/70 text-blue-100 px-2 py-0.5 rounded-md text-sm">
                {branch.totalQuantity} عدد
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs for Products and Invoices */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        className="bg-gray-800 rounded-lg text-white pt-4 mb-6 invoice-warranty-tabs"
        type="card"
        items={[
          {
            key: "products",
            label: (
              <span className="text-white px-3 py-1 text-base font-medium">
                محصولات
              </span>
            ),
            children: (
              <Card
                title={
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">محصولات شعبه</span>
                    <Button
                      type="primary"
                      onClick={() => setProductDrawerVisible(true)}
                      className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 border-blue-700"
                    >
                      <span>افزودن محصول</span>
                      <PlusOutlined className="mr-2" />
                    </Button>
                  </div>
                }
                className="bg-gray-800 rounded-lg overflow-hidden text-white border-0"
                headStyle={{
                  backgroundColor: "#19202b",
                  borderBottom: "1px solid #374151",
                  color: "#f3f4f6",
                  padding: "16px 20px",
                  fontFamily: "inherit",
                }}
                bodyStyle={{
                  backgroundColor: "#19202b",
                  padding: "16px 20px",
                  fontFamily: "inherit",
                }}
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
                      pagination={{
                        current: productPagination.current,
                        pageSize: productPagination.pageSize,
                        total: productPagination.total,
                        onChange: (page, pageSize) => {
                          if (branch) {
                            fetchBranchProducts(
                              branch.branchid,
                              page,
                              pageSize || productPagination.pageSize
                            );
                          }
                        },
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ["10", "20", "50"],
                        position: ["bottomCenter"],
                        className: "pagination-dark",
                      }}
                      className="dark-table enhanced-table rtl-table"
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
            ),
          },
          {
            key: "invoices",
            label: (
              <span className="text-white px-3 py-1 text-base font-medium flex items-center">
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
              <>
                {/* Improved Search UI */}
                <Card
                  className="mb-4 bg-gray-800 border-0 shadow-md"
                  headStyle={{
                    backgroundColor: "#1f2937",
                    borderBottom: "1px solid #374151",
                    padding: "16px 20px",
                    fontFamily: "inherit",
                  }}
                  bodyStyle={{
                    backgroundColor: "#1f2937",
                    padding: "16px 20px",
                    fontFamily: "inherit",
                  }}
                  title={
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <h2 className="text-lg font-medium text-white m-0">
                        فاکتورها و گارانتی‌های شعبه
                      </h2>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => fetchInvoices()}
                          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 flex items-center"
                          loading={invoicesLoading}
                          icon={<ReloadOutlined />}
                        >
                          به‌روزرسانی
                        </Button>
                        <Button
                          type="primary"
                          onClick={handleCreateInvoice}
                          className="bg-green-600 hover:bg-green-700 flex items-center"
                        >
                          <span>ثبت فاکتور جدید</span>
                          <PlusOutlined className="mr-2" />
                        </Button>
                      </div>
                    </div>
                  }
                >
                  <div className="relative">
                    <AutoComplete
                      placeholder="جستجوی شماره فاکتور، نام مشتری، شماره تماس یا کد گارانتی..."
                      popupMatchSelectWidth={500}
                      style={{ width: "100%" }}
                      options={searchOptions}
                      value={searchText}
                      onChange={setSearchText}
                      onSelect={(value) => setSearchText(value)}
                      listHeight={400}
                      listItemHeight={38}
                      showSearch
                      filterOption={false}
                      popupClassName="enhanced-dropdown"
                    >
                      <Input
                        suffix={<SearchOutlined className="text-blue-400" />}
                        style={{
                          backgroundColor: "#54647c",
                          color: "white",
                          borderColor: "#4b5563",
                          padding: "10px 12px",
                          height: "42px",
                          fontSize: "15px",
                          textAlign: "right",
                        }}
                      />
                    </AutoComplete>
                  </div>
                </Card>

                {/* Warranty Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Card
                    className="bg-gray-800 border-0 shadow-md hover:shadow-lg transition-shadow"
                    bodyStyle={{
                      padding: "16px 20px",
                      fontFamily: "inherit",
                      backgroundColor: "#1f2937",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-200 font-medium">
                        گارانتی‌های فعال:
                      </span>
                      <Tag
                        color="success"
                        className="text-base px-4 py-1.5 flex items-center justify-center min-w-[50px]"
                        style={{ fontFamily: "inherit" }}
                      >
                        {warrantySummary.active}
                      </Tag>
                    </div>
                  </Card>
                  <Card
                    className="bg-gray-800 border-0 shadow-md hover:shadow-lg transition-shadow"
                    bodyStyle={{
                      padding: "16px 20px",
                      fontFamily: "inherit",
                      backgroundColor: "#1f2937",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-200 font-medium">
                        گارانتی‌های منقضی شده:
                      </span>
                      <Tag
                        color="error"
                        className="text-base px-4 py-1.5 flex items-center justify-center min-w-[50px]"
                        style={{ fontFamily: "inherit" }}
                      >
                        {warrantySummary.expired}
                      </Tag>
                    </div>
                  </Card>
                </div>

                <Card
                  className="bg-gray-800 rounded-lg shadow-md overflow-hidden border-0 mb-6"
                  bodyStyle={{
                    padding: "0",
                    fontFamily: "inherit",
                    backgroundColor: "#1f2937",
                  }}
                  title={
                    <div className="flex items-center px-4 py-2">
                      <h3 className="text-white text-lg font-medium m-0">
                        فاکتورها
                      </h3>
                    </div>
                  }
                  headStyle={{
                    backgroundColor: "#1f2937",
                    borderBottom: "1px solid #374151",
                    color: "#f3f4f6",
                    padding: "12px 0",
                  }}
                >
                  {invoicesLoading ? (
                    <div className="flex justify-center items-center p-10">
                      <Spin size="large" tip="در حال بارگذاری..." />
                    </div>
                  ) : filteredInvoices.length === 0 ? (
                    <Empty
                      description="هیچ فاکتوری یافت نشد"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      className="p-8 text-gray-300"
                    />
                  ) : (
                    <Table
                      columns={memoizedInvoiceColumns}
                      dataSource={filteredInvoices}
                      rowKey="Invoiceid"
                      pagination={{
                        current: invoicePagination.current,
                        pageSize: invoicePagination.pageSize,
                        total: invoicePagination.total,
                        onChange: (page, pageSize) => {
                          fetchInvoices(
                            page,
                            pageSize || invoicePagination.pageSize
                          );
                        },
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ["10", "20", "50"],
                        position: ["bottomCenter"],
                        className: "pagination-dark",
                      }}
                      scroll={{ x: "max-content" }}
                      className="branch-invoices-table enhanced-table rtl-table"
                      rowClassName={(record) =>
                        !record.Checked ? "unread-invoice-row" : ""
                      }
                    />
                  )}
                </Card>

                {/* Standalone Warranties Section */}
                {filteredStandaloneWarranties.length > 0 && (
                  <Card
                    className="bg-gray-800 rounded-lg shadow-md overflow-hidden border-0"
                    bodyStyle={{
                      padding: "0",
                      fontFamily: "inherit",
                      backgroundColor: "#1f2937",
                    }}
                    title={
                      <div className="flex items-center px-4 py-2">
                        <h3 className="text-white text-lg font-medium m-0">
                          گارانتی‌های مستقل
                        </h3>
                        <Tag color="blue" className="mr-2">
                          {filteredStandaloneWarranties.length} گارانتی
                        </Tag>
                      </div>
                    }
                    headStyle={{
                      backgroundColor: "#1f2937",
                      borderBottom: "1px solid #374151",
                      color: "#f3f4f6",
                      padding: "12px 0",
                    }}
                  >
                    {invoicesLoading ? (
                      <div className="flex justify-center items-center p-10">
                        <Spin size="large" tip="در حال بارگذاری..." />
                      </div>
                    ) : (
                      <Table
                        columns={[
                          {
                            title: "کد گارانتی",
                            dataIndex: "warrantycode",
                            key: "warrantycode",
                            className: "text-right font-medium",
                            render: (text: string) => (
                              <span className="text-orange-400 font-medium">
                                {text}
                              </span>
                            ),
                          },
                          {
                            title: "نام مشتری",
                            dataIndex: "clientFullName",
                            key: "clientFullName",
                            className: "text-right font-medium",
                            render: (text: string) => (
                              <span className="text-green-400 font-medium">
                                {text || "نامشخص"}
                              </span>
                            ),
                          },
                          {
                            title: "شماره تماس",
                            dataIndex: "ClientPhoneNumber",
                            key: "ClientPhoneNumber",
                            className: "text-right font-medium",
                            render: (phone: string) =>
                              phone ? (
                                <a
                                  href={`tel:${phone}`}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  {phone}
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              ),
                          },
                          {
                            title: "نوع محصول",
                            dataIndex: "Type",
                            key: "Type",
                            className: "text-right font-medium",
                            render: (text: string) => (
                              <span className="text-gray-100">{text}</span>
                            ),
                          },
                          {
                            title: "تاریخ شروع",
                            dataIndex: "startdate",
                            key: "startdate",
                            className: "text-right font-medium",
                            render: (date: string) => {
                              try {
                                // Try to use moment to format into Persian date
                                const persianDate = moment(date)
                                  .locale("fa")
                                  .format("jYYYY/jMM/jDD");
                                return (
                                  <span className="text-gray-200">
                                    {persianDate}
                                  </span>
                                );
                              } catch (e) {
                                return (
                                  <span className="text-gray-200">
                                    {formatDate(date)}
                                  </span>
                                );
                              }
                            },
                          },
                          {
                            title: "تاریخ انقضا",
                            dataIndex: "expirydate",
                            key: "expirydate",
                            className: "text-right font-medium",
                            render: (date: string) => {
                              try {
                                // Try to use moment to format into Persian date
                                const persianDate = moment(date)
                                  .locale("fa")
                                  .format("jYYYY/jMM/jDD");
                                return (
                                  <span className="text-gray-200">
                                    {persianDate}
                                  </span>
                                );
                              } catch (e) {
                                return (
                                  <span className="text-gray-200">
                                    {formatDate(date)}
                                  </span>
                                );
                              }
                            },
                          },
                          {
                            title: "وضعیت",
                            dataIndex: "displayStatus",
                            key: "displayStatus",
                            className: "text-center font-medium",
                            render: (status: string) => (
                              <Tag
                                color={
                                  status === "Expired" ? "error" : "success"
                                }
                                className="px-4 py-1.5 flex items-center justify-center min-w-[120px]"
                                style={{
                                  fontFamily: "inherit",
                                  fontWeight: 500,
                                }}
                              >
                                {status === "Expired" ? "منقضی شده" : "فعال"}
                              </Tag>
                            ),
                          },
                          {
                            title: "عملیات",
                            key: "actions",
                            className: "text-center font-medium",
                            render: (_, warranty: any) => (
                              <Button
                                type="primary"
                                className="bg-blue-600 hover:bg-blue-700 border-blue-700 flex items-center"
                                onClick={() => {
                                  // Log the warranty object to debug
                                  console.log(
                                    "Opening standalone warranty details:",
                                    warranty
                                  );

                                  // Create an item object expected by BranchWarrantyViewModal
                                  const warrantyItem = {
                                    Invoice_Details: String(
                                      warranty.invoicedetailid || ""
                                    ),
                                    ProductId: String(warranty.ProductId || ""),
                                    quantity: warranty.quantity || 1,
                                    price: warranty.price || 0,
                                    total_price:
                                      (warranty.price || 0) *
                                      (warranty.quantity || 1),
                                    Name: warranty.Type,
                                    Type: warranty.Type,
                                    individualWarranty: {
                                      ...warranty,
                                      warrantyid: String(
                                        warranty.warrantyid || ""
                                      ),
                                      invoicedetailid: String(
                                        warranty.invoicedetailid || ""
                                      ),
                                      ProductId: String(
                                        warranty.ProductId || ""
                                      ),
                                      branchid: String(warranty.branchid || ""),
                                      branchname: branch?.name,
                                    },
                                  };

                                  // Set the selected standalone warranty to show the modal
                                  setSelectedStandaloneWarranty(warrantyItem);
                                }}
                              >
                                <span>مشاهده جزئیات</span>
                                <EyeOutlined className="mr-2" />
                              </Button>
                            ),
                          },
                        ]}
                        dataSource={filteredStandaloneWarranties}
                        rowKey="warrantyid"
                        pagination={{
                          pageSize: 5,
                          hideOnSinglePage: true,
                          position: ["bottomCenter"],
                          className: "pagination-dark",
                        }}
                        scroll={{ x: "max-content" }}
                        className="standalone-warranties-table enhanced-table rtl-table"
                      />
                    )}
                  </Card>
                )}
              </>
            ),
          },
          {
            key: "warranty-requests",
            label: (
              <span className="text-white px-3 py-1 text-base font-medium">
                درخواست‌های گارانتی
              </span>
            ),
            children: (
              <Card
                className="bg-gray-800 rounded-lg overflow-hidden text-white border-0"
                bodyStyle={{
                  backgroundColor: "#19202b",
                  padding: "16px 20px",
                  fontFamily: "inherit",
                }}
              >
                <WarrantyRequests
                  isTabActive={activeTab === "warranty-requests"}
                />
              </Card>
            ),
          },
          {
            key: "warranty-stats",
            label: (
              <span className="text-white px-3 py-1 text-base font-medium">
                آمار گارانتی‌ها
              </span>
            ),
            children: (
              <Card
                className="bg-gray-800 rounded-lg overflow-hidden text-white border-0"
                bodyStyle={{
                  padding: "16px 20px",
                  fontFamily: "inherit",
                }}
              >
                <WarrantyStats isTabActive={activeTab === "warranty-stats"} />
              </Card>
            ),
          },
        ]}
      />

      {/* Add InvoiceModal */}
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
        onQuantityChange={(value) =>
          value !== null && setProductQuantity(value)
        }
        onAddProduct={handleAddProduct}
        onUpdateQuantity={handleUpdateProductQuantity}
      />

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <BranchInvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => {
            setSelectedInvoice(null);
            // Refresh the invoices data when closing the modal
            fetchInvoices();
          }}
        />
      )}

      {/* Standalone Warranty Modal */}
      {selectedStandaloneWarranty && (
        <BranchWarrantyViewModal
          item={selectedStandaloneWarranty}
          onClose={() => {
            setSelectedStandaloneWarranty(null);
            // Refresh the data when closing the modal
            fetchInvoices();
          }}
        />
      )}

      {/* Global Styles */}
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

        /* Make scrollbar more visible */
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

        /* RTL specific styles */
        .ant-btn > .anticon + span,
        .ant-btn > span + .anticon {
          margin-right: 8px;
          margin-left: 0;
        }

        .ant-btn-icon-only.ant-btn-sm > * {
          font-size: 14px;
        }

        /* Properly align button icons in RTL */
        button.ant-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        /* Fix input group addon positioning in RTL */
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

        /* Fix drawer alignment in RTL mode */
        .ant-drawer .ant-drawer-content {
          direction: rtl;
        }

        /* Improved mobile responsiveness */
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

        /* Improved Invoice and Warranty UI */
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

        /* Enhanced tables */
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

        /* Highlight unread invoices */
        .unread-invoice-row {
          background-color: rgba(245, 158, 11, 0.15) !important;
        }

        .unread-invoice-row:hover > td {
          background-color: rgba(245, 158, 11, 0.25) !important;
        }

        /* Better tags */
        .ant-tag {
          border-radius: 4px !important;
          font-family: inherit !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
        }

        /* Fix font family for antd components */
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

        /* Improved search box */
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

        /* Improved buttons */
        .ant-btn {
          border-radius: 6px !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
          font-weight: 500 !important;
        }

        .ant-btn-primary {
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1) !important;
        }

        /* Existing RTL and responsive styles */
        /* ... */

        .ant-input::placeholder {
          color: #9ca3af !important;
          text-align: center !important;
          opacity: 1 !important;
        }

        .ant-input-affix-wrapper .ant-input {
          text-align: center !important;
        }

        .ant-input-affix-wrapper .ant-input::placeholder {
          color: #9ca3af !important;
          text-align: center !important;
          opacity: 1 !important;
        }

        .ant-select-selection-search-input {
          text-align: center !important;
        }

        .ant-select-selection-search-input::placeholder {
          color: #9ca3af !important;
          text-align: center !important;
          opacity: 1 !important;
        }

        /* Improve tag text readability */
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

        /* Add better styling for the search input to match what's shown in the image */
        .ant-input-affix-wrapper {
          border-radius: 8px !important;
          height: 42px !important;
        }

        /* Ensure search icon color matches design */
        .ant-input-suffix .anticon-search {
          color: #ffffff !important;
          opacity: 0.7;
        }

        /* Add better contrast for tabs */
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

        /* Add RTL table styles from branches page */
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

        /* Add better contrast for pagination */
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

        /* Persian text for pagination */
        .pagination-dark .ant-pagination-options-quick-jumper {
          display: none !important; /* Hide the quick jumper completely */
        }

        /* Position the quick jumper container for RTL */
        .pagination-dark .ant-pagination-options {
          direction: rtl !important;
        }

        /* Fix per page text in the dropdown */
        .pagination-dark
          .ant-pagination-options
          .ant-select-selection-item::after {
          content: " / صفحه" !important;
          display: inline !important;
        }

        /* Fix dropdown items */
        .pagination-dark
          .ant-select-dropdown
          .ant-select-item-option-content::after {
          content: " / صفحه" !important;
        }

        /* Page size selector styling */
        .pagination-dark
          .ant-pagination-options-size-changer
          .ant-select-selector {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
          color: #e5e7eb !important;
        }

        .pagination-dark
          .ant-pagination-options-size-changer:hover
          .ant-select-selector {
          border-color: #3b82f6 !important;
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
