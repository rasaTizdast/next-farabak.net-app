"use client";

import jalaali from "jalali-moment";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ResponsiveDataRegion } from "@/components/operations/ResponsiveDataRegion";
import { getUserInvoices } from "@/helpers/invoiceHandlers";

import InvoiceDetails from "./components/ui/InvoiceDetails";
import SkeletonTable from "./components/ui/SkeletonTable";

type Product = {
  Invoiceid: string;
  price: number;
  discount?: number;
  ProductId: number;
  quantity: number;
  total_price: number;
  Invoice_Details: number;
};

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

const currencyFormatter = new Intl.NumberFormat("fa-IR");

function formatPersianDate(dateString: string) {
  try {
    if (!dateString) return "تاریخ نامشخص";
    return jalaali(dateString).locale("fa").format("YYYY/MM/DD HH:mm");
  } catch {
    return dateString || "تاریخ نامشخص";
  }
}

function getTimeRemaining(dateString: string, checked: boolean) {
  try {
    const createdAt = jalaali(dateString);
    if (!createdAt.isValid()) return "تاریخ نامشخص";
    const expiry = createdAt.clone().add(48, "hours");
    const totalMinutes = expiry.diff(jalaali(), "minutes");

    if (totalMinutes <= 0) return checked ? "تایید شده پس از انقضا" : "منقضی شده";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours >= 24
      ? `${Math.floor(hours / 24)} روز و ${hours % 24} ساعت مانده`
      : `${hours} ساعت و ${minutes} دقیقه مانده`;
  } catch {
    return "تاریخ نامشخص";
  }
}

function InvoiceStatus({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${checked ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}
    >
      {checked ? "تایید شده" : "در انتظار تایید"}
    </span>
  );
}

function InvoiceCard({
  invoice,
  onShow,
}: {
  invoice: Invoice;
  onShow: (invoice: Invoice) => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">شماره فاکتور</p>
          <p className="mt-1 font-bold text-(--farabak-ink-deep)" dir="ltr">
            {invoice.FactorGuid}
          </p>
        </div>
        <InvoiceStatus checked={invoice.Checked} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs text-slate-500">مبلغ کل</dt>
          <dd className="mt-1 font-semibold text-slate-800">
            {currencyFormatter.format(invoice.TotalAmount)} تومان
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">زمان ثبت</dt>
          <dd className="mt-1 text-slate-800" dir="ltr">
            {formatPersianDate(invoice.Date)}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-slate-600">
        {getTimeRemaining(invoice.Date, invoice.Checked)}
      </p>
      <button
        type="button"
        onClick={() => onShow(invoice)}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-(--farabak-action-blue) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--farabak-ink-deep) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) motion-reduce:transition-none"
      >
        مشاهده فاکتور {invoice.FactorGuid}
      </button>
    </article>
  );
}

const AllInvoices = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserInvoices();
      setInvoices(Array.isArray(response) ? response : []);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "خطایی در دریافت فاکتورها رخ داد.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  if (loading) return <SkeletonTable />;

  if (error) {
    return (
      <div
        className="flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900"
        role="alert"
      >
        <h1 className="text-xl font-bold">فاکتورها بارگذاری نشدند</h1>
        <p className="text-sm leading-7">{error}</p>
        <button
          type="button"
          onClick={fetchInvoices}
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl bg-(--farabak-ink-deep) px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--farabak-action-blue) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) motion-reduce:transition-none"
        >
          تلاش دوباره
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      <header className="border-b border-slate-200 pb-6">
        <p className="mb-2 text-sm font-semibold text-(--farabak-action-blue)">میز کار شخصی</p>
        <h1 className="text-2xl font-extrabold text-(--farabak-ink-deep)">فاکتورهای من</h1>
        <p className="mt-2 text-sm leading-7 text-(--farabak-ink-muted)">
          فاکتورها، وضعیت بررسی و جزئیات گارانتی را یک‌جا ببینید.
        </p>
      </header>

      {invoices.some((invoice) => !invoice.Checked) && (
        <aside
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900"
          role="note"
        >
          فاکتورهایی که طی ۴۸ ساعت تأیید نشوند ممکن است به دلیل اعتبار محدود قیمت‌ها حذف شوند. برای
          پیگیری، با{" "}
          <Link className="font-bold underline" href="/contact-us">
            فرابک تماس بگیرید
          </Link>
          .
        </aside>
      )}

      {invoices.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"
          role="status"
        >
          <p className="font-semibold text-slate-800">هنوز فاکتوری ثبت نکرده‌اید.</p>
          <p className="text-sm text-slate-600">
            از محصولات شروع کنید و فاکتور مورد نیازتان را بسازید.
          </p>
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-(--farabak-action-blue) px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--farabak-ink-deep) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) motion-reduce:transition-none"
          >
            شروع فاکتور جدید
          </Link>
        </div>
      ) : (
        <ResponsiveDataRegion
          label="فاکتورهای ثبت شده"
          table={
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <caption className="sr-only">فهرست فاکتورهای ثبت شده</caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th scope="col" className="p-4 text-start font-semibold">
                    شماره فاکتور
                  </th>
                  <th scope="col" className="p-4 text-start font-semibold">
                    مبلغ کل
                  </th>
                  <th scope="col" className="p-4 text-start font-semibold">
                    وضعیت
                  </th>
                  <th scope="col" className="p-4 text-start font-semibold">
                    زمان ثبت
                  </th>
                  <th scope="col" className="p-4 text-start font-semibold">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.FactorGuid}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50 motion-reduce:transition-none"
                  >
                    <td className="p-4 font-semibold" dir="ltr">
                      {invoice.FactorGuid}
                    </td>
                    <td className="p-4">{currencyFormatter.format(invoice.TotalAmount)} تومان</td>
                    <td className="p-4">
                      <InvoiceStatus checked={invoice.Checked} />
                    </td>
                    <td className="p-4">
                      <span dir="ltr">{formatPersianDate(invoice.Date)}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {getTimeRemaining(invoice.Date, invoice.Checked)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(invoice)}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-(--farabak-action-blue) px-4 py-2 font-semibold text-white transition-colors hover:bg-(--farabak-ink-deep) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) motion-reduce:transition-none"
                      >
                        مشاهده فاکتور {invoice.FactorGuid}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        >
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.FactorGuid} invoice={invoice} onShow={setSelectedInvoice} />
          ))}
        </ResponsiveDataRegion>
      )}

      {selectedInvoice && (
        <InvoiceDetails invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};

export default AllInvoices;
