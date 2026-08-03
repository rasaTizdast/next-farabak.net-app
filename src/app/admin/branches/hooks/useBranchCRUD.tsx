"use client";

import { Form, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";

import { Branch, Product, User } from "../components/types";

async function fetchBranchesHelper(
  page: number,
  pageSize: number,
  searchProductId: number | null,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>,
  setTotalBranchCount: React.Dispatch<React.SetStateAction<number>>,
  setPagination: React.Dispatch<
    React.SetStateAction<{ current: number; pageSize: number; total: number }>
  >
) {
  try {
    setLoading(true);
    let url = `/api/admin/branches?page=${page}&limit=${pageSize}`;

    if (searchProductId) {
      url += `&productId=${searchProductId}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      message.error("خطا در بارگذاری شعبه‌ها");
      return;
    }
    const responseData = await response.json();

    setBranches(responseData.data);
    setTotalBranchCount(responseData.pagination.totalBranchCount || 0);
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
}

export function useBranchCRUD() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editBranchModalVisible, setEditBranchModalVisible] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchProductId, setSearchProductId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [totalBranchCount, setTotalBranchCount] = useState<number>(0);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchBranchesRef = useRef<() => Promise<void>>(undefined);
  const paginationRef = useRef(pagination);
  const searchProductIdRef = useRef(searchProductId);
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);
  useEffect(() => {
    searchProductIdRef.current = searchProductId;
  }, [searchProductId]);

  const { mutate: createBranchMutate } = useApiMutation("post");
  const { mutate: updateBranchMutate } = useApiMutation("put");
  const { mutate: deleteBranchMutate } = useApiMutation("delete");

  const { data: usersData } = useApiFetch<User[]>("/api/admin/users");

  const fetchBranches = useCallback(
    async (page?: number, pageSize?: number, overrideProductId?: number | null) => {
      const p = page ?? paginationRef.current.current;
      const ps = pageSize ?? paginationRef.current.pageSize;
      const productId =
        overrideProductId !== undefined ? overrideProductId : searchProductIdRef.current;
      await fetchBranchesHelper(
        p,
        ps,
        productId,
        setLoading,
        setBranches,
        setTotalBranchCount,
        setPagination
      );
    },
    []
  );

  const handleCreateBranch = async (values: any) => {
    const result = await createBranchMutate("/api/admin/branches", values);
    if (result) {
      message.success("شعبه با موفقیت ایجاد شد");
      setModalVisible(false);
      form.resetFields();
      fetchBranches();
    } else {
      message.error("خطا در ایجاد شعبه");
    }
  };

  const handleUpdateBranch = async (values: any) => {
    if (!currentBranch) return;

    const result = await updateBranchMutate(
      `/api/admin/branches/${currentBranch.branchid}`,
      values
    );
    if (result) {
      message.success("شعبه با موفقیت بروزرسانی شد");
      setEditBranchModalVisible(false);
      editForm.resetFields();
      fetchBranches();
    } else {
      message.error("خطا در بروزرسانی شعبه");
    }
  };

  const handleDeleteBranch = async (branchId: number) => {
    const result = await deleteBranchMutate(`/api/admin/branches/${branchId}`);
    if (result) {
      message.success("شعبه با موفقیت حذف شد");
      fetchBranches();
    } else {
      message.error("خطا در حذف شعبه");
    }
  };

  const showEditBranchModal = (branch: Branch) => {
    setCurrentBranch(branch);
    setEditBranchModalVisible(true);
  };

  const clearSearch = () => {
    setSearchValue("");
    setSearchProductId(null);
    fetchBranches(1, pagination.pageSize, null);
    router.push("/admin/branches");
  };

  const handleSearch = (
    value: string,
    allProducts: Product[],
    currentPagination: { current: number; pageSize: number; total: number }
  ) => {
    setSearchValue(value);

    if (!value.trim()) {
      clearSearch();
      return;
    }

    let foundProduct = allProducts.find(
      (product) => product.Type && product.Type.toLowerCase() === value.toLowerCase()
    );

    if (!foundProduct) {
      foundProduct = allProducts.find(
        (product) => product.Type && product.Type.toLowerCase().includes(value.toLowerCase())
      );
    }

    if (foundProduct) {
      setSearchProductId(foundProduct.ProductId);
      fetchBranches(1, currentPagination.pageSize, foundProduct.ProductId);
      router.push(`/admin/branches?productId=${foundProduct.ProductId}`);
    } else {
      setSearchProductId(null);
      fetchBranches(1, currentPagination.pageSize, null);
      router.push("/admin/branches");
    }
  };

  const getSearchOptions = (allProducts: Product[], searchValue: string) => {
    if (!allProducts || allProducts.length === 0) return [];

    if (!searchValue || searchValue.trim() === "") {
      return allProducts.map((product) => ({
        value: product.Type || "",
        label: (
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">{product.Type}</span>
            <span className="rounded-md bg-blue-900/30 px-2 py-0.5 text-xs text-blue-300">
              کد: {product.ProductId}
            </span>
          </div>
        ),
      }));
    }

    const lowerCaseSearch = searchValue.toLowerCase();

    return allProducts.reduce<{ value: string; label: React.JSX.Element }[]>((acc, product) => {
      if (product.Type && product.Type.toLowerCase().includes(lowerCaseSearch)) {
        acc.push({
          value: product.Type,
          label: (
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">{product.Type}</span>
              <span className="rounded-md bg-blue-900/30 px-2 py-0.5 text-xs text-blue-300">
                کد: {product.ProductId}
              </span>
            </div>
          ),
        });
      }
      return acc;
    }, []);
  };

  return {
    branches,
    loading,
    refreshing,
    initialLoading,
    setInitialLoading,
    setRefreshing,
    pagination,
    totalBranchCount,
    modalVisible,
    editBranchModalVisible,
    currentBranch,
    searchValue,
    searchProductId,
    form,
    editForm,
    usersData,
    fetchBranchesRef,
    searchParams,
    fetchBranches,
    setModalVisible,
    setEditBranchModalVisible,
    setCurrentBranch,
    setSearchValue,
    setSearchProductId,
    handleCreateBranch,
    handleUpdateBranch,
    handleDeleteBranch,
    showEditBranchModal,
    clearSearch,
    handleSearch,
    getSearchOptions,
  };
}
