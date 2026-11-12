"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { ResponsiveDataRegion } from "@/components/operations/ResponsiveDataRegion";
import { useInvoice } from "@/context/InvoiceContext";
import { useUser } from "@/context/UserContext";
import { addNewInvoice } from "@/helpers/invoiceHandlers";

const currencyFormatter = new Intl.NumberFormat("fa-IR");

const e2p = (n: number | null | undefined) => {
  if (n === null || n === undefined) return "—";
  return n.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
};

type Product = {
  ProductId: number;
  ProductName: string;
  Quantity: number;
  Price?: number;
  Discount?: number;
  minAmount?: number | null;
  maxAmount?: number | null;
};

type Feedback =
  | { type: "idle" }
  | { type: "pending"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const StepProgress = ({ currentStep }: { currentStep: number }) => (
  <ol
    aria-label="مراحل ثبت فاکتور"
    className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm"
  >
    {["انتخاب محصول", "بررسی فاکتور", "ثبت نهایی"].map((step, index) => {
      const stepNumber = index + 1;
      const isCurrent = stepNumber === currentStep;
      const isComplete = stepNumber < currentStep;

      return (
        <li
          key={step}
          className={`rounded-xl border px-2 py-3 ${isCurrent ? "border-(--farabak-action-blue) bg-blue-50 font-bold text-(--farabak-action-blue)" : isComplete ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-500"}`}
        >
          <span className="mb-1 block text-xs" dir="ltr">
            {e2p(stepNumber)}
          </span>
          {step}
        </li>
      );
    })}
  </ol>
);

const QuantityInput = ({
  product,
  onChange,
}: {
  product: Product;
  onChange: (productId: number, value: string) => void;
}) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={`quantity-${product.ProductId}`}
      className="text-xs font-semibold text-slate-700"
    >
      تعداد
    </label>
    <input
      id={`quantity-${product.ProductId}`}
      type="number"
      min={product.minAmount ?? 0}
      max={product.maxAmount && product.maxAmount < Infinity ? product.maxAmount : undefined}
      value={product.Quantity}
      onChange={(event) => onChange(product.ProductId, event.target.value)}
      aria-label={`تعداد ${product.ProductName}`}
      className="min-h-11 w-24 rounded-xl border border-slate-300 bg-white p-2 text-center text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue)"
    />
    {(product.minAmount !== null || product.maxAmount !== null) && (
      <span className="text-xs text-slate-500">
        {product.minAmount && product.minAmount > 0 ? `حداقل ${e2p(product.minAmount)}` : ""}
        {product.minAmount && product.maxAmount ? " · " : ""}
        {product.maxAmount && product.maxAmount < Infinity
          ? `حداکثر ${e2p(product.maxAmount)}`
          : ""}
      </span>
    )}
  </div>
);

const NewInvoicePage = () => {
  const { invoice, removeProductFromInvoice, updateProductQuantity, clearInvoice } = useInvoice();
  const { user } = useUser();
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ type: "idle" });
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!invoiceSuccess) return;
    const redirectTimer = setTimeout(() => router.push("/dashboard/all-invoices"), 5000);
    return () => clearTimeout(redirectTimer);
  }, [invoiceSuccess, router]);

  const handleQuantityChange = (productId: number, newQuantity: string) => {
    if (!newQuantity.trim()) return;
    const num = parseInt(newQuantity, 10) || 0;
    const product = invoice.products.find((item) => item.ProductId === productId);
    if (!product) return;

    const min = product.minAmount ?? 0;
    const max = product.maxAmount ?? Infinity;

    if (num < min && num > 0) {
      setFeedback({
        type: "error",
        message: `حداقل تعداد مجاز برای «${product.ProductName}»: ${e2p(min)} عدد.`,
      });
      updateProductQuantity(productId, min);
    } else if (num > max) {
      setFeedback({
        type: "error",
        message: `حداکثر تعداد مجاز برای «${product.ProductName}»: ${e2p(max)} عدد.`,
      });
      updateProductQuantity(productId, max);
    } else if (num <= 0) {
      setFeedback({ type: "error", message: "برای حذف محصول از دکمه حذف محصول استفاده کنید." });
    } else {
      setFeedback({ type: "idle" });
      updateProductQuantity(productId, num);
    }
  };

  const addNewInvoiceHandler = async () => {
    if (invoice.products.length === 0 || submitting) return;
    setSubmitting(true);
    setFeedback({ type: "pending", message: "در حال ثبت فاکتور…" });

    try {
      const response = await addNewInvoice(invoice, user);
      if (!response) throw new Error("ثبت فاکتور انجام نشد.");
      startTransition(() => {
        setInvoiceSuccess(true);
        setFeedback({ type: "success", message: "فاکتور با موفقیت ثبت شد." });
        clearInvoice();
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "خطا در ثبت فاکتور. لطفاً دوباره تلاش کنید.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const currentStep = invoiceSuccess ? 3 : invoice.products.length > 0 ? 2 : 1;

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-8 sm:p-7">
      <header>
        <p className="mb-2 text-sm font-semibold text-(--farabak-action-blue)">میز کار شخصی</p>
        <h1 className="text-2xl font-extrabold text-(--farabak-ink-deep)">ثبت فاکتور جدید</h1>
        <p className="mt-2 text-sm leading-7 text-(--farabak-ink-muted)">
          محصولات، تعداد و قیمت نهایی را بررسی کنید و بعد فاکتور را برای فرابک ارسال کنید.
        </p>
      </header>

      <StepProgress currentStep={currentStep} />

      {invoiceSuccess && (
        <div
          className="motion-safe:animate-fade-in rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm leading-7 font-semibold text-emerald-800 motion-reduce:animate-none"
          role="status"
        >
          فاکتور جدید ثبت شد. برای دیدن جزئیات به{" "}
          <Link className="underline" href="/dashboard/all-invoices">
            فاکتورها
          </Link>{" "}
          بروید؛ انتقال خودکار تا ۵ ثانیه دیگر انجام می‌شود.
        </div>
      )}

      {feedback.type !== "idle" && !invoiceSuccess && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm leading-6 ${feedback.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-blue-200 bg-blue-50 text-blue-900"}`}
        >
          {feedback.message}
        </p>
      )}

      {invoiceSuccess ? null : invoice.products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-semibold text-slate-800">فعلاً محصولی داخل فاکتور شما نیست.</p>
          <p className="text-sm text-slate-600">
            از فهرست محصولات، گزینه‌های مناسب را به فاکتور اضافه کنید.
          </p>
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-(--farabak-action-blue) px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--farabak-ink-deep) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) motion-reduce:transition-none"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <ResponsiveDataRegion
          label="اقلام فاکتور"
          table={
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <caption className="sr-only">اقلام انتخاب‌شده برای فاکتور</caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[
                    "نام محصول",
                    "قیمت واحد",
                    "تعداد",
                    "مجموع قیمت",
                    "تخفیف کل",
                    "قیمت نهایی",
                    "عملیات",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="p-4 text-start font-semibold text-slate-700"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.products.map((product) => {
                  const price = product.Price ?? 0;
                  const discount = product.Discount ?? 0;
                  return (
                    <tr
                      key={product.ProductId}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50 motion-reduce:transition-none"
                    >
                      <td className="p-4 font-medium">{product.ProductName}</td>
                      <td className="p-4">{currencyFormatter.format(price)} تومان</td>
                      <td className="p-4">
                        <QuantityInput product={product} onChange={handleQuantityChange} />
                      </td>
                      <td className="p-4">
                        {currencyFormatter.format(price * product.Quantity)} تومان
                      </td>
                      <td className="p-4">
                        {currencyFormatter.format(discount * product.Quantity)} تومان
                      </td>
                      <td className="p-4 font-bold">
                        {currencyFormatter.format((price - discount) * product.Quantity)} تومان
                      </td>
                      <td className="p-4">
                        <RemoveButton product={product} onRemove={removeProductFromInvoice} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          }
        >
          {invoice.products.map((product) => {
            const price = product.Price ?? 0;
            const discount = product.Discount ?? 0;
            return (
              <article
                key={product.ProductId}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h2 className="font-bold text-(--farabak-ink-deep)">{product.ProductName}</h2>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">قیمت واحد</dt>
                    <dd className="mt-1">{currencyFormatter.format(price)} تومان</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">قیمت نهایی</dt>
                    <dd className="mt-1 font-bold">
                      {currencyFormatter.format((price - discount) * product.Quantity)} تومان
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <QuantityInput product={product} onChange={handleQuantityChange} />
                  <RemoveButton product={product} onRemove={removeProductFromInvoice} />
                </div>
              </article>
            );
          })}
        </ResponsiveDataRegion>
      )}

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-bold text-(--farabak-ink-deep)">
          تعداد کل محصولات: {currencyFormatter.format(invoice.TotalAmount)}
        </p>
        <button
          type="button"
          onClick={addNewInvoiceHandler}
          disabled={invoice.products.length === 0 || submitting || invoiceSuccess}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-(--farabak-action-blue) px-6 py-3 font-semibold text-white transition-colors hover:bg-(--farabak-ink-deep) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:w-auto"
        >
          {submitting ? "در حال ثبت…" : "ثبت فاکتور جدید"}
        </button>
      </div>
    </div>
  );
};

const RemoveButton = ({
  product,
  onRemove,
}: {
  product: Product;
  onRemove: (productId: number) => void;
}) => (
  <button
    type="button"
    onClick={() => onRemove(product.ProductId)}
    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 motion-reduce:transition-none"
  >
    حذف محصول
  </button>
);

export default NewInvoicePage;
