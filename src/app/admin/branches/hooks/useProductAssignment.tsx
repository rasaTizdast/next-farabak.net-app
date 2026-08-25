"use client";

import { Form, message } from "antd";
import { useEffect, useRef, useState } from "react";

import { useApiMutation } from "@/hooks/useApiMutation";

import { Branch, Product } from "../components/types";

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
  setProductsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) {
  try {
    setProductsLoading(true);
    const response = await fetch(`/api/admin/branches/${branchId}/products`);
    if (!response.ok) {
      message.error("خطا در بارگذاری محصولات شعبه");
      setProducts([]);
      return;
    }
    const responseData = await response.json();

    const productsArray =
      responseData.data && Array.isArray(responseData.data)
        ? responseData.data
        : Array.isArray(responseData)
          ? responseData
          : [];

    setProducts(productsArray);
  } catch (error) {
    console.error("Error fetching branch products:", error);
    message.error("خطا در بارگذاری محصولات شعبه");
    setProducts([]);
  } finally {
    setProductsLoading(false);
  }
}

interface UseProductAssignmentParams {
  currentBranch: Branch | null;
  onBranchChange: (branch: Branch | null) => void;
  onRefreshBranches: () => Promise<void>;
}

export function useProductAssignment({
  currentBranch,
  onBranchChange,
  onRefreshBranches,
}: UseProductAssignmentParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productDrawerVisible, setProductDrawerVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const productQuantityRef = useRef<number>(1);
  const [productForm] = Form.useForm();
  const fetchBranchProductsRef = useRef<(branchId: number) => Promise<void>>(undefined);
  const productsRefreshTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const { mutate: addProductMutate } = useApiMutation("post");
  const { mutate: updateProductQtyMutate } = useApiMutation("put");
  const { mutate: removeProductMutate } = useApiMutation("delete");

  const fetchAllProducts = async () => {
    await fetchAllProductsHelper(setProductsLoading, setAllProducts);
  };

  const fetchBranchProducts = async (branchId: number) => {
    await fetchBranchProductsHelper(branchId, setProductsLoading, setProducts);
  };

  useEffect(() => {
    fetchBranchProductsRef.current = fetchBranchProducts;
  }, []);

  useEffect(() => {
    return () => {
      if (productsRefreshTimeoutIdRef.current) {
        clearTimeout(productsRefreshTimeoutIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let productsIntervalId: NodeJS.Timeout | null = null;

    if (productDrawerVisible && currentBranch) {
      productsIntervalId = setInterval(() => {
        setProductsLoading(true);
        fetchBranchProductsRef.current?.(currentBranch.branchid).finally(() => {
          productsRefreshTimeoutIdRef.current = setTimeout(() => setProductsLoading(false), 500);
        });
      }, 30000);
    }

    return () => {
      if (productsIntervalId) {
        clearInterval(productsIntervalId);
      }
      if (productsRefreshTimeoutIdRef.current) {
        clearTimeout(productsRefreshTimeoutIdRef.current);
      }
    };
  }, [productDrawerVisible, currentBranch]);

  const handleViewProducts = (branch: Branch) => {
    onBranchChange(branch);
    fetchBranchProducts(branch.branchid);
    setProductDrawerVisible(true);
  };

  const handleCreateInvoice = (branch: Branch) => {
    onBranchChange(branch);
    setInvoiceModalVisible(true);
  };

  const handleAddProduct = async () => {
    if (!currentBranch || !selectedProduct) return;

    const result = await addProductMutate(
      `/api/admin/branches/${currentBranch.branchid}/products`,
      {
        productId: selectedProduct,
        quantity: productQuantityRef.current,
      }
    );
    if (result) {
      message.success("محصول با موفقیت به شعبه اضافه شد");
      productForm.resetFields();
      setSelectedProduct(null);
      productQuantityRef.current = 1;
      await fetchBranchProducts(currentBranch.branchid);
      await onRefreshBranches();
    } else {
      message.error("خطا در افزودن محصول به شعبه");
    }
  };

  const handleUpdateProductQuantity = async (productId: number, quantity: number) => {
    if (!currentBranch) return;

    const result = await updateProductQtyMutate(
      `/api/admin/branches/${currentBranch.branchid}/products/${productId}`,
      { quantity }
    );
    if (result) {
      message.success("تعداد محصول با موفقیت بروزرسانی شد");
      await fetchBranchProducts(currentBranch.branchid);
      await onRefreshBranches();
    } else {
      message.error("خطا در بروزرسانی تعداد محصول");
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    if (!currentBranch) return;

    const result = await removeProductMutate(
      `/api/admin/branches/${currentBranch.branchid}/products/${productId}`
    );
    if (result) {
      message.success("محصول با موفقیت از شعبه حذف شد");
      await fetchBranchProducts(currentBranch.branchid);
      await onRefreshBranches();
    } else {
      message.error("خطا در حذف محصول از شعبه");
    }
  };

  const closeDrawer = () => setProductDrawerVisible(false);
  const closeInvoice = () => setInvoiceModalVisible(false);

  return {
    allProducts,
    products,
    productsLoading,
    productDrawerVisible,
    invoiceModalVisible,
    selectedProduct,
    productQuantityRef,
    productForm,
    fetchAllProducts,
    fetchBranchProducts,
    handleViewProducts,
    handleCreateInvoice,
    handleAddProduct,
    handleUpdateProductQuantity,
    handleRemoveProduct,
    setSelectedProduct,
    closeDrawer,
    closeInvoice,
  };
}
