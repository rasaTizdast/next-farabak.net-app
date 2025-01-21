"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { getUserInvoices, checkUserInvoice } from "@/helpers/invoiceHandlers";

import InvoiceDetails from "./components/ui/InvoiceDetails";
import SkeletonTable from "./components/ui/SkeletonTable";

import { useUser } from "@/context/UserContext";

import styles from "./AllInvoices.module.css";
import toast, { Toaster } from "react-hot-toast";

type Product = {
  Invoiceid: string;
  price: number;
  discount: number;
  ProductId: number;
  quantity: number;
  total_price: number;
};

// Types
type Invoice = {
  Fullname: string;
  Phonenumber: string;
  Checked: boolean;
  FactorGuid: string;
  Quantity: string;
  TotalAmount: number;
  Date: string;
  Invoiceid: number;
  Invoice_Details: Product[];
};

interface EmailDetails {
  to: string;
  text: string;
  subject: string;
}

const AllInvoices = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserInvoices();
      // const transformedData = transformInvoiceData(response);
      setInvoices(response);
    } catch (error: unknown) {
      // Check if the error is an instance of Error before accessing properties
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleShowInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleCloseModal = () => {
    setSelectedInvoice(null);
  };

  const sendEmail = async (emailDetails: EmailDetails) => {
    try {
      await axios.post("/api/send-email", emailDetails);
    } catch (error) {
      throw new Error("Failed to send email");
    }
  };

  const [updatingGuid, setUpdatingGuid] = useState<string | null>(null);

  const handleCheckInvoice = async (guid: string, email?: string) => {
    if (!email) {
      toast.error("برای انجام این عملیات نیاز به ایمیل شما داریم!", {
        duration: 5000,
      });
      return;
    }
    setUpdatingGuid(guid); // Show loader for this button
    try {
      await checkUserInvoice(guid);
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice.FactorGuid === guid ? { ...invoice, Checked: true } : invoice
        )
      );
      const emailDetails: EmailDetails = {
        to: email,
        subject: `فاکتور ${guid}`,
        text: `فاکتور جدید ثبت شد. برای مشاهده به پنل کاربری خود مراجعه کنید.`,
      };
      await sendEmail(emailDetails);
      toast.success(
        "فاکتور شما ثبت شد، به زودی با شما برای نهایی سازی فاکتور تماس میگیریم!",
        { duration: 5000 }
      );
    } catch (error) {
      toast.error("عملیات ثبت فاکتور با شکست مواجه شد، مجددا تلاش کنید!", {
        duration: 5000,
      });
    } finally {
      setUpdatingGuid(null); // Reset loader
    }
  };

  if (loading) {
    return <SkeletonTable />;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <div className={styles.errorContent}>
          <span>
            مشکلی در دریافت اطلاعات به وجود آمده است، دوباره تلاش کنید.
          </span>
          <button onClick={fetchInvoices}>تلاش مجدد</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-center" />
      <h3 className="font-bold">فاکتورها ثبت شده توسط شما</h3>
      <div className={styles.tableContainer}>
        <table className={styles.invoicesTable}>
          <thead>
            <tr>
              <th>شماره فاکتور</th>
              <th>تعداد محصولات</th>
              <th>عملیات‌ها</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>
                  هیچ فاکتوری پیدا نشد
                </td>
              </tr>
            ) : (
              invoices.map((item) => (
                <tr key={item.FactorGuid}>
                  <td>{item.FactorGuid}</td>
                  <td>{item.TotalAmount}</td>
                  <td className={styles.actionsParent}>
                    <button
                      onClick={() => handleShowInvoice(item)}
                      className={styles.show}
                    >
                      مشاهده فاکتور
                    </button>
                    {!item.Checked && (
                      <button
                        onClick={() =>
                          handleCheckInvoice(item.FactorGuid, user?.email)
                        }
                        className={styles.confirm}
                        disabled={updatingGuid === item.FactorGuid}
                      >
                        {updatingGuid === item.FactorGuid
                          ? "در حال تایید..."
                          : "تائید فاکتور"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedInvoice && (
        <InvoiceDetails invoice={selectedInvoice} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default AllInvoices;
