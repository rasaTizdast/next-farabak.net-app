"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";

import { useInvoice } from "@/context/InvoiceContext";
import { useUser } from "@/context/UserContext";
import { addNewInvoice } from "@/helpers/invoiceHandlers";

const currencyFormatter = new Intl.NumberFormat("fa-IR");

const e2p = (n: number | null | undefined) => {
  if (n === null || n === undefined) return "—";
  return n.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
};

const NewInvoicePage = () => {
  const { invoice, removeProductFromInvoice, updateProductQuantity, clearInvoice } = useInvoice();
  const { user } = useUser();
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (invoiceSuccess) {
      const redirectTimer = setTimeout(() => {
        router.push("/dashboard/all-invoices");
      }, 5000);
      return () => clearTimeout(redirectTimer);
    }
  }, [invoiceSuccess, router]);

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
        startTransition(() => {
          setInvoiceSuccess(true);
          clearInvoice();
        });
      }
    } catch (error) {
      toast.error("خطا در ثبت فاکتور. لطفاً دوباره تلاش کنید.");
      console.error(error);
    }
  };

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className="mx-auto max-w-[1200px] rounded-[8px] bg-[#f9f9f9] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-[576px]:px-4">
        {invoiceSuccess && (
          <div className="animate-fade-in mb-6 rounded-lg border border-[#2e7d32] bg-[#e6f7e6] p-4 text-center font-semibold text-[#2e7d32] shadow-[0_4px_8px_rgba(0,0,0,0.05)]">
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

        <h1 className="mb-8 text-center text-[1.3rem] font-extrabold">ثبت فاکتور جدید</h1>

        {invoice.products.length === 0 ? (
          <div className="py-10 text-center text-lg text-gray-600">
            فعلاً محصولی داخل فاکتور شما نیست!
          </div>
        ) : (
          <table className="mb-8 w-full table-fixed border-collapse">
            <thead>
              <tr>
                <th className="border border-[#ccc] bg-white p-4 text-start">نام محصول</th>
                <th className="border border-[#ccc] bg-white p-4 text-start">قیمت واحد (تومان)</th>
                <th className="border border-[#ccc] bg-white p-4 text-start">تعداد</th>
                <th className="border border-[#ccc] bg-white p-4 text-start">مجموع قیمت</th>
                <th className="border border-[#ccc] bg-white p-4 text-start">تخفیف کل</th>
                <th className="border border-[#ccc] bg-white p-4 text-start">قیمت نهایی</th>
                <th className="border border-[#ccc] bg-white p-4 text-start">عملیات</th>
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
                    <td className="border border-[#ccc] p-4 text-start font-medium">
                      {product.ProductName}
                    </td>
                    <td className="border border-[#ccc] p-4 text-start">
                      {currencyFormatter.format(price)}
                    </td>

                    <td className="border border-[#ccc] p-4 text-start">
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="number"
                          min={min ?? 0}
                          max={max && max < Infinity ? max : undefined}
                          value={quantity}
                          onChange={(e) => handleQuantityChange(product.ProductId, e.target.value)}
                          aria-label={`تعداد ${product.ProductName}`}
                          className={`w-20 rounded-[4px] border p-2 text-center ${
                            isAtMin
                              ? "border-2 border-[#2e7d32]"
                              : isAtMax
                                ? "border-2 border-[#d32f2f]"
                                : "border border-[#ccc]"
                          }`}
                        />

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

                    <td className="border border-[#ccc] p-4 text-start">
                      {currencyFormatter.format(price * quantity)}
                    </td>
                    <td className="border border-[#ccc] p-4 text-start">
                      {currencyFormatter.format(discount * quantity)}
                    </td>
                    <td className="border border-[#ccc] p-4 text-start text-lg font-bold">
                      {currencyFormatter.format((price - discount) * quantity)}
                    </td>

                    <td className="border border-[#ccc] p-4 text-start">
                      <button
                        type="button"
                        onClick={() => removeProductFromInvoice(product.ProductId)}
                        className="cursor-pointer rounded-[4px] border-none bg-[#ff4d4d] px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-[#ff3333] md:px-4 md:py-2"
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

        <div className="flex flex-col gap-4">
          <p className="text-[1.25rem] font-bold">
            تعداد کل محصولات: {currencyFormatter.format(invoice.TotalAmount)}
          </p>
          <button
            type="button"
            onClick={addNewInvoiceHandler}
            disabled={invoice.products.length === 0}
            className="w-full cursor-pointer rounded-[6px] border-none bg-[#003262] px-8 py-3 text-white transition-colors duration-300 hover:bg-[#0e6aff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ذخیره فاکتور جدید
          </button>
        </div>
      </div>
    </>
  );
};

export default NewInvoicePage;
