"use client";

export const dynamic = "force-dynamic";

import { addNewInvoice } from "@/helpers/invoiceHandlers";
import { useUser } from "@/context/UserContext";
import { useInvoice } from "@/context/InvoiceContext";
import styles from "./NewInvoice.module.css";
import toast, { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NewInvoicePage = () => {
  const {
    invoice,
    removeProductFromInvoice,
    updateProductQuantity,
    clearInvoice,
  } = useInvoice();
  const { user } = useUser();
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);
  const router = useRouter();

  // Redirect to all-invoices page after successful invoice creation
  useEffect(() => {
    if (invoiceSuccess) {
      const redirectTimer = setTimeout(() => {
        router.push("/dashboard/all-invoices");
      }, 5000); // Redirect after 5 seconds

      return () => clearTimeout(redirectTimer);
    }
  }, [invoiceSuccess, router]);

  const handleQuantityChange = (ProductId: number, newQuantity: string) => {
    const parsedQuantity = +newQuantity;
    if (parsedQuantity >= 0) {
      // Validate quantity is non-negative
      updateProductQuantity(ProductId, parsedQuantity);
    }
  };

  const addNewInvoiceHandler = async () => {
    try {
      const response = await addNewInvoice(invoice, user);
      if (response) {
        toast.success(
          "فاکتور جدید با موفقیت ساخته شد، برای دیدن فاکتور به صفحه فاکتور ها مراجعه کنید",
          { duration: 10000 } // 10 seconds
        );
        setInvoiceSuccess(true);
        clearInvoice(); // Clear the invoice after a successful post
      }
    } catch (error) {
      toast.error("پروسه اضافه شدن فاکتور با شکست مواجه شد، دوباره تلاش کنید!");
      setInvoiceSuccess(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className={styles.container}>
        {invoiceSuccess && (
          <div className={styles.successNotice}>
            فاکتور جدید با موفقیت ساخته شد، برای دیدن فاکتور به صفحه{" "}
            <Link
              href="/dashboard/all-invoices"
              className="text-blue-800 underline font-bold hover:text-blue-950 transition-all"
            >
              فاکتور ها
            </Link>{" "}
            مراجعه کنید
            <div className="mt-2 text-sm">
              شما بعد از ۵ ثانیه به صورت خودکار به صفحه فاکتورها منتقل خواهید
              شد...
            </div>
          </div>
        )}
        <h1 className={styles.header}>ثبت فاکتور جدید</h1>

        <table className={styles.invoiceTable}>
          <thead>
            <tr>
              <th>نام محصول</th>
              <th>قیمت واحد - تومان</th>
              <th>تعداد</th>
              <th>مجموع قیمت - تومان</th>
              <th>تخفیف - تومان</th>
              <th>قیمت نهایی - تومان</th>
              <th>عملیات‌ها</th>
            </tr>
          </thead>
          <tbody>
            {invoice.products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  فعلا محصولی داخل فاکتور شما نیست!
                </td>
              </tr>
            ) : (
              invoice.products.map((product) => {
                // Safeguard for undefined properties
                const price = product.Price ?? 0;
                const discount = product.Discount ?? 0;
                const quantity = product.Quantity ?? 0;

                return (
                  <tr key={product.ProductId}>
                    <td>{product.ProductName}</td>
                    <td>{Intl.NumberFormat("fa-IR").format(price)}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            product.ProductId,
                            e.target.value
                          )
                        }
                        className={styles.quantityInput}
                      />
                    </td>
                    <td>
                      {Intl.NumberFormat("fa-IR").format(price * quantity)}
                    </td>
                    <td>
                      {Intl.NumberFormat("fa-IR").format(discount * quantity)}
                    </td>
                    <td>
                      {Intl.NumberFormat("fa-IR").format(
                        price * quantity - discount * quantity
                      )}
                    </td>
                    <td>
                      <button
                        className={styles.clearButton}
                        onClick={() =>
                          removeProductFromInvoice(product.ProductId)
                        }
                      >
                        حذف محصول
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className={styles.actions}>
          <p className={styles.total}>
            تعداد کل محصولات:{" "}
            {Intl.NumberFormat("fa-IR").format(invoice.TotalAmount)}
          </p>
          <button
            className={styles.finalizeButton}
            onClick={addNewInvoiceHandler}
          >
            ذخیره فاکتور جدید
          </button>
        </div>
      </div>
    </>
  );
};

export default NewInvoicePage;
