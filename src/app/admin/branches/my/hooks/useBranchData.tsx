"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { message, Form, InputNumber } from "antd";
import { useApiMutation } from "@/hooks/useApiMutation";
import { Branch, Product } from "../../components/types";

async function fetchAllProductsHelper(
  setProductsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
) {
  try {
    setProductsLoading(true);

    try {
      const response = await fetch("/api/admin/products/all", {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.ok) {
        const responseData = await response.json();

        if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          setAllProducts(responseData.data);
          return;
        }
      }
    } catch (error) {
      console.error("Error with new endpoint:", error);
    }

    let allFetchedProducts: Product[] = [];
    let currentPage = 1;
    let hasMorePages = true;
    const pageSize = 100;

    while (hasMorePages) {
      const response = await fetch(`/api/admin/products?page=${currentPage}&limit=${pageSize}`);

      if (!response.ok) {
        break;
      }

      const data = await response.json();
      const products = data.data || [];

      allFetchedProducts = [...allFetchedProducts, ...products];

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
}

async function fetchBranchProductsHelper(
  branchId: number,
  page: number,
  pageSize: number,
  setProductsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setProductPagination: React.Dispatch<
    React.SetStateAction<{ current: number; pageSize: number; total: number }>
  >
) {
  try {
    setProductsLoading(true);
    const response = await fetch(
      `/api/admin/branches/${branchId}/products?page=${page}&limit=${pageSize}`
    );
    if (!response.ok) {
      message.error("خطا در بارگذاری محصولات شعبه");
      return;
    }
    const responseData = await response.json();

    if (Array.isArray(responseData)) {
      setProducts(responseData);
      setProductPagination((prev) => ({
        ...prev,
        total: responseData.length,
      }));
    } else if (responseData.data) {
      setProducts(responseData.data);
      setProductPagination({
        current: responseData.pagination.currentPage,
        pageSize: pageSize,
        total: responseData.pagination.totalCount,
      });
    } else {
      setProducts([]);
      setProductPagination((prev) => ({
        ...prev,
        total: 0,
      }));
    }
  } catch (error) {
    console.error("Error fetching branch products:", error);
    message.error("خطا در بارگذاری محصولات شعبه");
  } finally {
    setProductsLoading(false);
  }
}

async function doLoadInitialBranchData(
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setAuthError: React.Dispatch<React.SetStateAction<boolean>>,
  setBranch: React.Dispatch<React.SetStateAction<Branch | null>>,
  fetchBranchProducts: (branchId: number, page?: number, pageSize?: number) => Promise<void>,
  fetchInvoices: () => Promise<void>,
  fetchAllProducts: () => Promise<void>
) {
  setLoading(true);
  try {
    const response = await fetch("/api/admin/branches/my");

    if (!response.ok) {
      if (response.status === 404) {
        setError("شما هنوز به عنوان شعبه تعریف نشده‌اید. لطفاً با مدیر سایت تماس بگیرید.");
        setLoading(false);
        return;
      }

      if (response.status === 401) {
        setAuthError(true);
        setError("دسترسی غیرمجاز - لطفا وارد حساب کاربری خود شوید.");
        setLoading(false);
        return;
      }

      setError("خطا در دریافت اطلاعات شعبه");
      setLoading(false);
      return;
    }

    const branchData = await response.json();
    setBranch(branchData);

    await Promise.all([
      fetchBranchProducts(branchData.branchid),
      fetchInvoices(),
      fetchAllProducts(),
    ]);
  } catch (error) {
    console.error("Error fetching branch data:", error);
    setError("خطا در بارگذاری اطلاعات شعبه");
  } finally {
    setLoading(false);
  }
}

async function doAutoRefreshHelper(
  setRefreshing: React.Dispatch<React.SetStateAction<boolean>>,
  setBranch: React.Dispatch<React.SetStateAction<Branch | null>>,
  fetchBranchProductsFn: (branchId: number, page?: number, pageSize?: number) => Promise<void>
) {
  try {
    setRefreshing(true);
    const response = await fetch("/api/admin/branches/my");
    if (response.ok) {
      const branchData = await response.json();
      setBranch(branchData);
      if (branchData && branchData.branchid) {
        await fetchBranchProductsFn(branchData.branchid);
      }
    } else {
      console.error("Failed to refresh branch data:", response.status);
    }
  } catch (error) {
    console.error("Error auto-refreshing branch data:", error);
  } finally {
    setRefreshing(false);
  }
}

export async function loadInitialBranchData(
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setAuthError: React.Dispatch<React.SetStateAction<boolean>>,
  setBranch: React.Dispatch<React.SetStateAction<Branch | null>>,
  fetchBranchProducts: (branchId: number, page?: number, pageSize?: number) => Promise<void>,
  fetchInvoices: () => Promise<void>,
  fetchAllProducts: () => Promise<void>
) {
  await doLoadInitialBranchData(
    setLoading,
    setError,
    setAuthError,
    setBranch,
    fetchBranchProducts,
    fetchInvoices,
    fetchAllProducts
  );
}

export async function doAutoRefresh(
  setRefreshing: React.Dispatch<React.SetStateAction<boolean>>,
  setBranch: React.Dispatch<React.SetStateAction<Branch | null>>,
  fetchBranchProductsRef: React.MutableRefObject<
    (branchId: number, page?: number, pageSize?: number) => Promise<void>
  >
) {
  await doAutoRefreshHelper(setRefreshing, setBranch, fetchBranchProductsRef.current);
}

export function useBranchData() {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);
  const [productDrawerVisible, setProductDrawerVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const productQuantityRef = useRef<number>(1);
  const [productForm] = Form.useForm();
  const [debouncedQuantities, setDebouncedQuantities] = useState<{
    [key: number]: number;
  }>({});
  const quantityTimersRef = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const [productPagination, setProductPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { mutate: addProductMutate } = useApiMutation("post");
  const { mutate: updateProductQtyMutate } = useApiMutation("put");

  const currentBranchIdRef = useRef<number | null>(null);
  const productPaginationRef = useRef(productPagination);
  const branchRef = useRef(branch);

  useEffect(() => {
    productPaginationRef.current = productPagination;
  }, [productPagination]);
  useEffect(() => {
    branchRef.current = branch;
  }, [branch]);

  useEffect(() => {
    return () => {
      Object.values(quantityTimersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (branch) {
      currentBranchIdRef.current = branch.branchid;
    }
  }, [branch]);

  const fetchAllProducts = useCallback(async () => {
    await fetchAllProductsHelper(setProductsLoading, setAllProducts);
  }, []);

  const fetchBranchProducts = useCallback(
    async (branchId: number, page?: number, pageSize?: number) => {
      const p = page ?? productPaginationRef.current.current;
      const ps = pageSize ?? productPaginationRef.current.pageSize;
      await fetchBranchProductsHelper(
        branchId,
        p,
        ps,
        setProductsLoading,
        setProducts,
        setProductPagination
      );
    },
    []
  );

  const fetchBranchProductsRef = useRef(fetchBranchProducts);
  useEffect(() => {
    fetchBranchProductsRef.current = fetchBranchProducts;
  }, [fetchBranchProducts]);

  useEffect(() => {
    let productsIntervalId: NodeJS.Timeout | null = null;

    if (productDrawerVisible && branch) {
      productsIntervalId = setInterval(() => {
        setProductsLoading(true);
        fetchBranchProductsRef.current(branch.branchid).finally(() => {
          setTimeout(() => setProductsLoading(false), 500);
        });
      }, 30000);
    }

    return () => {
      if (productsIntervalId) {
        clearInterval(productsIntervalId);
      }
    };
  }, [productDrawerVisible, branch]);

  const handleAddProduct = async () => {
    if (!branch || !selectedProduct) return;

    const result = await addProductMutate(`/api/admin/branches/${branch.branchid}/products`, {
      productId: selectedProduct,
      quantity: productQuantityRef.current,
    });
    if (result) {
      message.success("محصول با موفقیت به شعبه اضافه شد");
      productForm.resetFields();
      setSelectedProduct(null);
      productQuantityRef.current = 1;
      await fetchBranchProducts(branch.branchid);
      const branchResponse = await fetch("/api/admin/branches/my");
      if (branchResponse.ok) {
        const branchData = await branchResponse.json();
        setBranch(branchData);
      }
    } else {
      message.error("خطا در افزودن محصول به شعبه");
    }
  };

  const handleUpdateProductQuantity = async (productId: number, quantity: number) => {
    if (!branch) return;

    const result = await updateProductQtyMutate(
      `/api/admin/branches/${branch.branchid}/products/${productId}`,
      { quantity }
    );
    if (result) {
      message.success("تعداد محصول با موفقیت بروزرسانی شد");
      await fetchBranchProducts(branch.branchid);
      const branchResponse = await fetch("/api/admin/branches/my");
      if (branchResponse.ok) {
        const branchData = await branchResponse.json();
        setBranch(branchData);
      }
    } else {
      message.error("خطا در بروزرسانی تعداد محصول");
    }
  };

  const handleDebouncedQuantityChange = (productId: number, value: number) => {
    if (quantityTimersRef.current[productId]) {
      clearTimeout(quantityTimersRef.current[productId]);
    }

    setDebouncedQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));

    quantityTimersRef.current[productId] = setTimeout(() => {
      handleUpdateProductQuantity(productId, value);
    }, 2000);
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
      render: (quantity: number, record: Product) => (
        <InputNumber
          min={record.quantity}
          value={debouncedQuantities[record.ProductId] ?? record.quantity}
          onChange={(value) => {
            if (value !== null && value >= record.quantity) {
              handleDebouncedQuantityChange(record.ProductId, value);
            }
          }}
          onBlur={() => {
            if (quantityTimersRef.current[record.ProductId]) {
              clearTimeout(quantityTimersRef.current[record.ProductId]);
              handleUpdateProductQuantity(record.ProductId, debouncedQuantities[record.ProductId]);
            }
          }}
          className="dark-input-number w-20"
          style={{
            backgroundColor: "#374151",
            borderColor: "#4b5563",
            color: "#e5e7eb",
          }}
        />
      ),
    },
  ];

  return {
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
    setProductPagination,
    productPaginationRef,
    fetchAllProducts,
    fetchBranchProducts,
    fetchBranchProductsRef,
    handleAddProduct,
    handleUpdateProductQuantity,
    handleDebouncedQuantityChange,
    productColumns,
  };
}