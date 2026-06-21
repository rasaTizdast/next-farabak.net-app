"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

import { useInvoice } from "@/context/InvoiceContext";
import { useUser } from "@/context/UserContext";
import { addNewInvoice } from "@/helpers/invoiceHandlers";

import styles from "./NewInvoice.module.css";

const NewInvoicePage = () => {
  const { invoice, removeProductFromInvoice, updateProductQuantity, clearInvoice } = useInvoice();
  const { user } = useUser();
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (invoiceSuccess) {
      const redirectTimer = setTimeout(() => {
        router.push("/dashboard/all-invoices");
      }, 5000);
      return () => clearTimeout(redirectTimer);
    }
  }, [invoiceSuccess, router]);

  // Persian digits helper
  const e2p = (n: number | null | undefined) => {
    if (n === null || n === undefined) return "—";
    return n.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
  };

  const handleQuantityChange = (ProductId: number, newQuantity: string) => {
    const num = parseInt(newQuantity) || 0;

    const product = invoice.products.find((p) => p.ProductId === ProductId);
    if (!product) return;

    const min = product.minAmount ?? 0;
    const max = product.maxAmount ?? Infinity;

    if (num < min && num > 0) {
      toast.error(`حداقل تعداد مجاز: ${e2p(min)} عدد`, { duration: 3000 });
      updateProductQuantity(ProductId, min);
    } else if (max !== Infinity && num > max) {
      toast.error(`حداکثر تعداد مجاز: ${e2p(max)} عدد`, { duration: 3000 });
      updateProductQuantity(ProductId, max);
    } else if (num <= 0) {
      removeProductFromInvoice(ProductId);
    } else {
      updateProductQuantity(ProductId, num);
    }
  };

  const addNewInvoiceHandler = async () => {
    try {
      const response = await addNewInvoice(invoice, user);
      if (response) {
        toast.success("فاکتور جدید با موفقیت ساخته شد، به صفحه فاکتورها منتقل می‌شوید...", {
          duration: 10000,
        });
        setInvoiceSuccess(true);
        clearInvoice();
      }
    } catch (error) {
      toast.error("خطا در ثبت فاکتور. لطفاً دوباره تلاش کنید.");
      console.error(error);
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
              className="font-bold text-blue-800 underline hover:text-blue-950"
            >
              فاکتور ها
            </Link>{" "}
            مراجعه کنید
            <div className="mt-2 text-sm">شما بعد از ۵ ثانیه به صورت خودکار منتقل خواهید شد...</div>
          </div>
        )}

        <h1 className={styles.header}>ثبت فاکتور جدید</h1>

        {invoice.products.length === 0 ? (
          <div className="py-10 text-center text-lg text-gray-600">
            فعلاً محصولی داخل فاکتور شما نیست!
          </div>
        ) : (
          <table className={`${styles.invoiceTable} table-fixed`}>
            <thead>
              <tr>
                <th>نام محصول</th>
                <th>قیمت واحد (تومان)</th>
                <th>تعداد</th>
                <th>مجموع قیمت</th>
                <th>تخفیف کل</th>
                <th>قیمت نهایی</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {invoice.products.map((product) => {
                const price = product.Price ?? 0;
                const discount = product.Discount ?? 0;
                const quantity = product.Quantity ?? 0;
                const min = product.minAmount!;
                const max = product.maxAmount!;

                const isAtMin = min !== null && min > 0 && quantity === min;
                const isAtMax = max !== null && max < Infinity && quantity === max;

                return (
                  <tr key={product.ProductId} className={quantity === 0 ? "opacity-50" : ""}>
                    <td className="font-medium">{product.ProductName}</td>
                    <td>{Intl.NumberFormat("fa-IR").format(price)}</td>

                    {/* Quantity with limits */}
                    <td>
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="number"
                          min={min ?? 0}
                          max={max && max < Infinity ? max : undefined}
                          value={quantity}
                          onChange={(e) => handleQuantityChange(product.ProductId, e.target.value)}
                          className={`${styles.quantityInput} w-20 text-center`}
                          style={{
                            borderColor: isAtMin ? "#16a34a" : isAtMax ? "#dc2626" : undefined,
                            borderWidth: isAtMin || isAtMax ? "2px" : "1px",
                          }}
                        />

                        {/* Limits indicator */}
                        {(min !== null || max !== null) && (
                          <div className="flex gap-3 text-xs text-gray-600">
                            {min !== null && min > 0 && (
                              <span className={isAtMin ? "font-bold text-green-600" : ""}>
                                حداقل: {e2p(min)}
                              </span>
                            )}
                            {max !== null && max < Infinity && (
                              <span className={isAtMax ? "font-bold text-red-600" : ""}>
                                حداکثر: {e2p(max)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>{Intl.NumberFormat("fa-IR").format(price * quantity)}</td>
                    <td>{Intl.NumberFormat("fa-IR").format(discount * quantity)}</td>
                    <td className="text-lg font-bold">
                      {Intl.NumberFormat("fa-IR").format((price - discount) * quantity)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className={styles.clearButton}
                        onClick={() => removeProductFromInvoice(product.ProductId)}
                      >
                        حذف محصول
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className={styles.actions}>
          <p className={styles.total}>
            تعداد کل محصولات: {Intl.NumberFormat("fa-IR").format(invoice.TotalAmount)}
          </p>
          <button
            type="button"
            className={styles.finalizeButton}
            onClick={addNewInvoiceHandler}
            disabled={invoice.products.length === 0}
          >
            ذخیره فاکتور جدید
          </button>
        </div>
      </div>
    </>
  );
};

export default NewInvoicePage;
