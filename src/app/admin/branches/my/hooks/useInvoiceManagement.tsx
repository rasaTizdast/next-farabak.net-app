"use client";

import { useState, useRef, useEffect } from "react";
import { message, Tag, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useApiMutation } from "@/hooks/useApiMutation";
import { AdminInvoice } from "@/app/admin/invoices/type";
import { Branch } from "../../components/types";

async function fetchInvoicesHelper(
  branch: Branch | null,
  page: number,
  pageSize: number,
  setInvoicesLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setInvoices: React.Dispatch<React.SetStateAction<AdminInvoice[]>>,
  setStandaloneWarranties: React.Dispatch<React.SetStateAction<any[]>>,
  setWarrantySummary: React.Dispatch<React.SetStateAction<{ active: number; expired: number }>>,
  setInvoicePagination: React.Dispatch<
    React.SetStateAction<{ current: number; pageSize: number; total: number }>
  >
) {
  if (!branch) return;

  try {
    setInvoicesLoading(true);
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
        setInvoicePagination({
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
    setInvoicesLoading(false);
  }
}

function getWarrantyStatusSummary(invoice: AdminInvoice) {
  if (!invoice.Invoice_Details || !Array.isArray(invoice.Invoice_Details)) {
    return null;
  }

  const hasWarranties = invoice.Invoice_Details.some((detail) => detail.warranty);
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
      (detail.warranty.status === "Expired" || detail.warranty.displayStatus === "Expired")
  ).length;

  return { active: activeWarranties, expired: expiredWarranties };
}

function formatDate(dateString: string | Date | number) {
  if (!dateString) return "-";
  try {
    if (typeof dateString === "object") {
      if (dateString instanceof Date) {
        return moment(dateString).format("YYYY/MM/DD | HH:mm:ss");
      }
    }
    if (typeof dateString === "number") {
      return moment(new Date(dateString)).format("YYYY/MM/DD | HH:mm:ss");
    }
    const dateStr = String(dateString);
    if (dateStr.includes("T") && dateStr.includes("Z")) {
      return moment(dateStr).format("YYYY/MM/DD | HH:mm:ss");
    }
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return moment(dateStr, "YYYY-MM-DD").format("YYYY/MM/DD");
    }
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return moment(dateStr, "DD/MM/YYYY").format("YYYY/MM/DD");
    }
    if (dateStr.match(/^\d{4}\/\d{2}\/\d{2} \| \d{2}:\d{2}:\d{2}$/)) {
      return dateStr;
    }
    const formattedDate = moment(dateStr).format("YYYY/MM/DD | HH:mm:ss");
    if (formattedDate === "Invalid date") {
      console.error("Failed to parse date:", dateStr);
      return dateStr;
    }
    return formattedDate;
  } catch (e) {
    console.error("Error formatting date:", e, typeof dateString, dateString);
    return String(dateString);
  }
}

function formatPersianDate(date: string, formatDateFn: (d: string | Date | number) => string) {
  try {
    return moment(date).locale("fa").format("jYYYY/jMM/jDD");
  } catch (e) {
    console.error(e);
    return formatDateFn(date);
  }
}

import moment from "jalali-moment";

export function useInvoiceManagement(branchRef: React.MutableRefObject<Branch | null>) {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [standaloneWarranties, setStandaloneWarranties] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(null);
  const [selectedStandaloneWarranty, setSelectedStandaloneWarranty] = useState<any | null>(null);
  const [warrantySummary, setWarrantySummary] = useState<{
    active: number;
    expired: number;
  }>({ active: 0, expired: 0 });
  const [invoicePagination, setInvoicePagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);

  const invoicePaginationRef = useRef(invoicePagination);
  useEffect(() => {
    invoicePaginationRef.current = invoicePagination;
  }, [invoicePagination]);

  const { mutate: updateInvoiceStatusMutate } = useApiMutation("patch");

  const fetchInvoices = async (page?: number, pageSize?: number) => {
    const p = page ?? invoicePaginationRef.current.current;
    const ps = pageSize ?? invoicePaginationRef.current.pageSize;
    await fetchInvoicesHelper(
      branchRef.current,
      p,
      ps,
      setInvoicesLoading,
      setInvoices,
      setStandaloneWarranties,
      setWarrantySummary,
      setInvoicePagination
    );
  };

  const handleCreateInvoice = () => {
    setInvoiceModalVisible(true);
  };

  const handleInvoiceCreationSuccess = () => {
    setInvoiceModalVisible(false);
    fetchInvoices();
    message.success("فاکتور با موفقیت ایجاد شد");
  };

  const updateInvoiceStatus = async (invoice: AdminInvoice, checked: boolean) => {
    const result = await updateInvoiceStatusMutate(`/api/admin/invoices?id=${invoice.Invoiceid}`, {
      checked,
    });
    if (result) {
      const updatedInvoices = invoices.map((inv) => {
        if (inv.Invoiceid === invoice.Invoiceid) {
          return { ...inv, Checked: checked };
        }
        return inv;
      });
      setInvoices(updatedInvoices);
      message.success("وضعیت فاکتور با موفقیت بروزرسانی شد");
    } else {
      message.error("خطا در بروزرسانی وضعیت فاکتور");
    }
  };

  const searchOptions = (() => {
    if (!searchText.trim()) return [];

    const lowerCaseSearch = searchText.toLowerCase();
    const options: { value: string; label: React.ReactNode }[] = [];

    if (invoices && Array.isArray(invoices) && invoices.length) {
      invoices.forEach((invoice) => {
        if (invoice.FactorGuid.toLowerCase().includes(lowerCaseSearch)) {
          options.push({
            value: invoice.FactorGuid,
            label: (
              <div>
                <span className="font-bold text-blue-500">شماره فاکتور: </span>
                {invoice.FactorGuid}
              </div>
            ),
          });
        }
      });

      invoices.forEach((invoice) => {
        if (invoice.Fullname.toLowerCase().includes(lowerCaseSearch)) {
          options.push({
            value: invoice.Fullname,
            label: (
              <div>
                <span className="font-bold text-green-500">نام مشتری: </span>
                {invoice.Fullname}
              </div>
            ),
          });
        }
      });

      invoices.forEach((invoice) => {
        if (invoice.Phonenumber && invoice.Phonenumber.includes(lowerCaseSearch)) {
          options.push({
            value: invoice.Phonenumber,
            label: (
              <div>
                <span className="font-bold text-purple-500">شماره تماس: </span>
                {invoice.Phonenumber}
              </div>
            ),
          });
        }
      });

      invoices.forEach((invoice) => {
        if (invoice.Invoice_Details && Array.isArray(invoice.Invoice_Details)) {
          invoice.Invoice_Details.forEach((detail) => {
            if (
              detail.warranty &&
              detail.warranty.warrantycode &&
              detail.warranty.warrantycode.toLowerCase().includes(lowerCaseSearch)
            ) {
              options.push({
                value: detail.warranty.warrantycode,
                label: (
                  <div>
                    <span className="font-bold text-yellow-500">کد گارانتی: </span>
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
                <span className="font-bold text-orange-500">کد گارانتی مستقل: </span>
                {warranty.warrantycode}
                <span className="mr-2">
                  {warranty.status === "Expired" || warranty.displayStatus === "Expired" ? (
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

        if (warranty.Type && warranty.Type.toLowerCase().includes(lowerCaseSearch)) {
          options.push({
            value: warranty.Type,
            label: (
              <div>
                <span className="font-bold text-cyan-500">محصول با گارانتی مستقل: </span>
                {warranty.Type}
              </div>
            ),
          });
        }
      });
    }

    return options;
  })();

  const filteredInvoices = (() => {
    if (!searchText.trim()) return invoices;

    const lowerCaseSearch = searchText.toLowerCase();

    return invoices.filter(
      (invoice) =>
        invoice.FactorGuid.toLowerCase().includes(lowerCaseSearch) ||
        invoice.Fullname.toLowerCase().includes(lowerCaseSearch) ||
        (invoice.Phonenumber && invoice.Phonenumber.includes(lowerCaseSearch)) ||
        (invoice.Invoice_Details &&
          invoice.Invoice_Details.some(
            (detail) =>
              detail.warranty &&
              detail.warranty.warrantycode &&
              detail.warranty.warrantycode.toLowerCase().includes(lowerCaseSearch)
          ))
    );
  })();

  const filteredStandaloneWarranties = (() => {
    if (!searchText.trim()) return standaloneWarranties;

    const lowerCaseSearch = searchText.toLowerCase();

    return standaloneWarranties.filter(
      (warranty) =>
        (warranty.warrantycode && warranty.warrantycode.toLowerCase().includes(lowerCaseSearch)) ||
        (warranty.Type && warranty.Type.toLowerCase().includes(lowerCaseSearch))
    );
  })();

  const memoizedInvoiceColumns = [
    {
      title: "شماره فاکتور",
      dataIndex: "FactorGuid",
      key: "FactorGuid",
      className: "text-right font-medium",
      render: (text: string) => <span className="font-medium text-blue-400">{text}</span>,
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
        <a href={`tel:${phone}`} className="text-blue-400 transition-colors hover:text-blue-300">
          {phone}
        </a>
      ),
    },
    {
      title: "تاریخ",
      dataIndex: "Date",
      key: "Date",
      className: "text-right font-medium",
      render: (date: string) => <span className="text-gray-200">{formatDate(date)}</span>,
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
              className="flex min-w-[120px] items-center justify-center px-4 py-1.5"
              style={{ fontFamily: "inherit", fontWeight: 500 }}
            >
              <span>بررسی شده</span>
            </Tag>
          ) : (
            <Tag
              color="warning"
              className="flex min-w-[120px] items-center justify-center px-4 py-1.5"
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
              className="flex min-w-[120px] items-center justify-center px-4 py-1.5"
              style={{ fontFamily: "inherit", fontWeight: 500 }}
            >
              <span>بدون گارانتی</span>
            </Tag>
          );
        }

        return (
          <div className="flex flex-wrap justify-center gap-2">
            {status.active > 0 && (
              <Tag
                color="success"
                className="flex min-w-[120px] items-center justify-center px-4 py-1.5"
                style={{ fontFamily: "inherit", fontWeight: 500 }}
              >
                <span>{status.active} گارانتی فعال</span>
              </Tag>
            )}
            {status.expired > 0 && (
              <Tag
                color="error"
                className="flex min-w-[120px] items-center justify-center px-4 py-1.5"
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
          htmlType="button"
          type="primary"
          className="flex items-center border-blue-700 bg-blue-600 hover:bg-blue-700"
          onClick={() => setSelectedInvoice(invoice)}
        >
          <span>مشاهده جزئیات</span>
          <EyeOutlined className="mr-2" />
        </Button>
      ),
    },
  ];

  return {
    invoices,
    setInvoices,
    standaloneWarranties,
    setStandaloneWarranties,
    invoicesLoading,
    setInvoicesLoading,
    searchText,
    setSearchText,
    selectedInvoice,
    setSelectedInvoice,
    selectedStandaloneWarranty,
    setSelectedStandaloneWarranty,
    warrantySummary,
    invoicePagination,
    invoiceModalVisible,
    setInvoiceModalVisible,
    invoicePaginationRef,
    fetchInvoices,
    handleCreateInvoice,
    handleInvoiceCreationSuccess,
    updateInvoiceStatus,
    searchOptions,
    filteredInvoices,
    filteredStandaloneWarranties,
    memoizedInvoiceColumns,
  };
}