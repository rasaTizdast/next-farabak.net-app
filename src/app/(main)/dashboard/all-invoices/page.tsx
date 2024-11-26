"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { getUserInvoices, checkUserInvoice } from "@/helpers/invoiceHandlers";

import InvoiceDetails from "./components/ui/InvoiceDetails";
import SkeletonTable from "./components/ui/SkeletonTable";

import { useUser } from "@/context/UserContext";

import styles from "./AllInvoices.module.css";

// Types
interface Product {
  id: number;
  name: string;
  amount: number;
}

interface Invoice {
  fullname: string;
  phonenumber: string;
  checked: boolean;
  guid: string;
  products: Product[];
  totalAmount: number;
  id: number;
  date: string;
}

type InvoiceApiData = {
  ProductName: string;
  Fullname: string;
  Phonenumber: string;
  Checked: boolean;
  FactorGuid: string;
  Quantity: string;
  TotalAmount: number;
  id: number;
  Date: string;
  UserId: number;
  FactorId: number;
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

  const transformInvoiceData = (invoices: InvoiceApiData[]) => {
    console.log("invoices: ", invoices);
    return invoices.map((invoice) => {
      const productNames = invoice.ProductName.replace(/[[\]]/g, "").split(",");
      const quantities = invoice.Quantity.split(",");

      const products: Product[] = productNames.map((name, index) => ({
        id: index + 1,
        name: name.trim(),
        amount: parseInt(quantities[index].trim(), 10),
      }));

      return {
        fullname: invoice.Fullname,
        phonenumber: invoice.Phonenumber,
        checked: invoice.Checked,
        guid: invoice.FactorGuid,
        products,
        totalAmount: +invoice.TotalAmount,
        id: invoice.FactorId,
        date: invoice.Date,
      };
    });
  };

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserInvoices();
      const transformedData = transformInvoiceData(response);
      setInvoices(transformedData);
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
      console.error("Failed to send email", error);
    }
  };

  const handleCheckInvoice = async (guid: string, email?: string) => {
    if (!email) {
      console.error("Email is required for this operation.");
      return; // Return early if email is not available
    }
    try {
      await checkUserInvoice(guid);
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice.guid === guid ? { ...invoice, checked: true } : invoice
        )
      );

      const emailDetails: EmailDetails = {
        to: email,
        subject: `فاکتور ${guid}`,
        text: `فاکتور جدید ثبت شد. برای مشاهده به پنل کاربری خود مراجعه کنید.`,
      };
      await sendEmail(emailDetails);
    } catch (error) {
      console.error("Failed to check invoice", error);
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
                <tr key={item.guid}>
                  <td>{item.guid}</td>
                  <td>{item.totalAmount}</td>
                  <td className={styles.actionsParent}>
                    <button
                      onClick={() => handleShowInvoice(item)}
                      className={styles.show}
                    >
                      مشاهده فاکتور
                    </button>
                    {!item.checked && (
                      <button
                        onClick={() =>
                          handleCheckInvoice(item.guid, user?.email)
                        }
                        className={styles.confirm}
                      >
                        تائید فاکتور
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
