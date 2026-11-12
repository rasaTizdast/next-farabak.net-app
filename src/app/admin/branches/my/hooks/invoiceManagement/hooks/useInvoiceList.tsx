"use client";

import { message } from "antd";
import { useCallback, useEffect, useRef } from "react";

import { AdminInvoice } from "@/app/admin/invoices/type";

import { StandaloneWarranty, useInvoiceManagementCore } from "../invoiceManagementContext";

async function fetchInvoicesHelper(
  branch: { branchid: number | string } | null,
  page: number,
  pageSize: number,
  setLoading: (v: boolean) => void,
  setInvoices: (v: AdminInvoice[]) => void,
  setStandaloneWarranties: (v: StandaloneWarranty[]) => void,
  setWarrantySummary: (v: { active: number; expired: number }) => void,
  setPagination: (v: { current: number; pageSize: number; total: number }) => void
) {
  if (!branch) return;

  try {
    setLoading(true);
    const response = await fetch(`/api/admin/branches/my/invoices?page=${page}&limit=${pageSize}`, {
      credentials: "include",
    });

    if (!response.ok) {
      message.error("خطا در بارگذاری فاکتورها");
      return;
    }

    const data = await response.json();
    if (data.invoices) {
      setInvoices(data.invoices);

      if (data.standaloneWarranties) {
        setStandaloneWarranties(data.standaloneWarranties);
      } else {
        setStandaloneWarranties([]);
      }

      if (data.warrantySummary) {
        setWarrantySummary(data.warrantySummary);
      }

      if (data.pagination) {
        setPagination({
          current: data.pagination.currentPage,
          pageSize: pageSize,
          total: data.pagination.totalCount,
        });
      }
    } else {
      setInvoices([]);
      setStandaloneWarranties([]);
    }
  } catch (error) {
    console.error("Error fetching invoices:", error);
    message.error("خطا در بارگذاری فاکتورها");
  } finally {
    setLoading(false);
  }
}

export function useInvoiceList() {
  const { state, dispatch, meta } = useInvoiceManagementCore();
  const { list } = state;
  const { branchRef } = meta;
  const paginationRef = useRef(list.pagination);

  useEffect(() => {
    paginationRef.current = list.pagination;
  }, [list.pagination]);

  const setInvoices = useCallback(
    (invoices: AdminInvoice[]) => dispatch({ type: "SET_INVOICES", invoices }),
    [dispatch]
  );
  const setStandaloneWarranties = useCallback(
    (warranties: StandaloneWarranty[]) =>
      dispatch({ type: "SET_STANDALONE_WARRANTIES", warranties }),
    [dispatch]
  );
  const setWarrantySummary = useCallback(
    (summary: { active: number; expired: number }) =>
      dispatch({ type: "SET_WARRANTY_SUMMARY", summary }),
    [dispatch]
  );
  const setLoading = useCallback(
    (loading: boolean) => dispatch({ type: "SET_LOADING", loading }),
    [dispatch]
  );

  const fetchInvoices = useCallback(
    async (page?: number, pageSize?: number) => {
      const p = page ?? paginationRef.current.current;
      const ps = pageSize ?? paginationRef.current.pageSize;
      await fetchInvoicesHelper(
        branchRef.current,
        p,
        ps,
        (v: boolean) => dispatch({ type: "SET_LOADING", loading: v }),
        (v: AdminInvoice[]) => dispatch({ type: "SET_INVOICES", invoices: v }),
        (v: StandaloneWarranty[]) => dispatch({ type: "SET_STANDALONE_WARRANTIES", warranties: v }),
        (v: { active: number; expired: number }) =>
          dispatch({ type: "SET_WARRANTY_SUMMARY", summary: v }),
        (v: { current: number; pageSize: number; total: number }) =>
          dispatch({ type: "SET_PAGINATION", pagination: v })
      );
    },
    [branchRef, dispatch]
  );

  const handleCreateInvoice = useCallback(
    () => dispatch({ type: "SET_MODAL_VISIBLE", visible: true }),
    [dispatch]
  );

  const handleInvoiceCreationSuccess = useCallback(() => {
    dispatch({ type: "SET_MODAL_VISIBLE", visible: false });
    fetchInvoices();
    message.success("فاکتور با موفقیت ایجاد شد");
  }, [dispatch, fetchInvoices]);

  return {
    ...list,
    fetchInvoices,
    handleCreateInvoice,
    handleInvoiceCreationSuccess,
    setInvoices,
    setStandaloneWarranties,
    setWarrantySummary,
    setLoading,
    setSearchText: (text: string) => dispatch({ type: "SET_SEARCH_TEXT", text }),
    setPagination: (p: Partial<{ current: number; pageSize: number; total: number }>) =>
      dispatch({ type: "SET_PAGINATION", pagination: p }),
    setModalVisible: (v: boolean) => dispatch({ type: "SET_MODAL_VISIBLE", visible: v }),
  };
}
