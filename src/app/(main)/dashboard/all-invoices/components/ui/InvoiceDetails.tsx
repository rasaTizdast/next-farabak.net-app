import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";

import logo from "../../../../../../../public/Farabak_Logo.webp";

const currencyFormatter = new Intl.NumberFormat("fa-IR");

async function fetchInvoiceData(
  invoice: {
    Fullname: string;
    Phonenumber: string;
    Checked: boolean;
    FactorGuid: string;
    Quantity: string;
    TotalAmount: number;
    Date: string;
    Invoiceid: number;
    Invoice_Details: {
      Invoiceid: string;
      price: number;
      discount?: number;
      ProductId: number;
      quantity: number;
      total_price: number;
      Invoice_Details: number;
    }[];
  },
  setProductNames: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>,
  setWarranties: React.Dispatch<React.SetStateAction<{ [key: number]: Warranty }>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  try {
    const productNameRequests = invoice.Invoice_Details.map((product) =>
      axios
        .get(`/api/products/getProductType/${product.ProductId}`)
        .then((res) => ({
          id: product.ProductId,
          name: res.data.productType,
        }))
        .catch(() => ({
          id: product.ProductId,
          name: `محصول ${product.ProductId}`,
        }))
    );

    const warrantyRequests = invoice.Invoice_Details.map((product, index) => {
      const detailId = product.Invoice_Details || null;
      const lookupKey = detailId || product.ProductId || index;

      if (!detailId) {
        console.warn(
          `Missing Invoice_Details ID for product ${product.ProductId} at index ${index}`
        );
        return Promise.resolve({
          id: lookupKey,
          warranty: null,
        });
      }

      return axios
        .get(`/api/warranties/getByInvoiceDetail/${detailId}`)
        .then((res) => ({
          id: lookupKey,
          warranty: res.data.warranty,
        }))
        .catch((error) => {
          console.error(`Error fetching warranty for detail ID ${detailId}:`, error);
          return {
            id: lookupKey,
            warranty: null,
          };
        });
    });

    const [productResults, warrantyResults] = await Promise.all([
      Promise.all(productNameRequests),
      Promise.all(warrantyRequests),
    ]);

    const names = productResults.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.name }), {});

    const warrantyData = warrantyResults.reduce(
      (acc, curr) => ({ ...acc, [curr.id]: curr.warranty }),
      {}
    );

    setProductNames(names);
    setWarranties(warrantyData);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setLoading(false);
  }
}

type Product = {
  Invoiceid: string;
  price: number;
  discount?: number;
  ProductId: number;
  quantity: number;
  total_price: number;
  Invoice_Details: number;
};

type Warranty = {
  warrantyid: number;
  warrantycode: string;
  startdate: string;
  expirydate: string;
  status: string;
} | null;

type Props = {
  onClose: () => void;
  invoice: {
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
};

function formatDateTime(isoString: string) {
  try {
    if (isoString && isoString.includes("T")) {
      const [datePart, timePart] = isoString.split("T");
      const [year, month, day] = datePart.split("-");
      const [hour, minute] = timePart.split(":").slice(0, 2);

      return `${year}/${month}/${day} | ${hour}:${minute}`;
    }

    const date = new Date(isoString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}/${month}/${day} | ${hours}:${minutes}`;
    }

    return isoString || "تاریخ نامشخص";
  } catch (error) {
    console.error(error);
    return isoString || "تاریخ نامشخص";
  }
}

function formatPersianDate(isoString: string) {
  try {
    if (isoString && isoString.includes("T")) {
      const [datePart] = isoString.split("T");
      const [year, month, day] = datePart.split("-");

      const formattedMonth = month.padStart(2, "0");
      const formattedDay = day.padStart(2, "0");

      return `${year}/${formattedMonth}/${formattedDay}`;
    }

    const date = new Date(isoString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }

    return isoString || "تاریخ نامشخص";
  } catch (error) {
    console.error(error);
    return isoString || "تاریخ نامشخص";
  }
}

function formatWarrantyStatus(status: string) {
  switch (status) {
    case "Active":
      return { text: "فعال", className: "bg-[#e6f7e6] text-[#2e7d32]" };
    case "Expired":
      return { text: "منقضی شده", className: "bg-[#ffeaea] text-[#d32f2f]" };
    case "Requested":
      return { text: "درخواست شده", className: "bg-[#fff8e1] text-[#ff8f00]" };
    default:
      return { text: status, className: "" };
  }
}

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount) + " تومان";
}

const InvoiceDetails = ({ invoice, onClose }: Props) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [productNames, setProductNames] = useState<{ [key: number]: string }>({});
  const [warranties, setWarranties] = useState<{ [key: number]: Warranty }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceData(invoice, setProductNames, setWarranties, setLoading);
  }, [invoice]);

  const handleDownload = () => {
    const input = componentRef.current;

    if (!input) return;

    html2canvas(input, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;

      const scaledWidth = pageWidth;
      const scaledHeight = pageWidth / ratio;

      if (scaledHeight > pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pageHeight * ratio, pageHeight);
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, scaledWidth, scaledHeight);
      }

      pdf.save(`فاکتور-${invoice.FactorGuid}-فرابک.pdf`);
    });
  };

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-[10] flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="max-h-[90vh] w-[90%] max-w-[850px] overflow-y-auto rounded-xl bg-white p-8 text-start shadow-[0_10px_25px_rgba(0,0,0,0.2)] md:p-8">
        {loading ? (
          <div className="space-y-4 p-8">
            <div className="mx-auto h-6 w-48 animate-pulse rounded-md bg-gray-300"></div>
            <div className="mx-auto h-4 w-32 animate-pulse rounded-md bg-gray-300"></div>
            <div className="h-6 w-full animate-pulse rounded-md bg-gray-300"></div>
            <div className="h-6 w-full animate-pulse rounded-md bg-gray-300"></div>
            <div className="h-2 w-full animate-pulse rounded-md bg-gray-300"></div>
            <div className="h-48 w-full animate-pulse rounded-md bg-gray-300"></div>
          </div>
        ) : (
          <div ref={componentRef} className="flex flex-col justify-center p-4 md:p-4" dir="rtl">
            <div className="mb-8 flex w-full items-center justify-center">
              <Image
                src={logo}
                alt="لوگوی فرابک"
                width={2066}
                height={182}
                quality={100}
                priority
                className="w-[25%] md:w-[40%] lg:w-[25%] xl:w-[25%] 2xl:w-[25%]"
              />
            </div>
            <div className="mb-8 border-b border-[#eaeaea] pb-6 text-center">
              <h3 className="mb-6 text-[1.5rem] text-[#003262]">
                فاکتور شماره: {invoice.FactorGuid}
              </h3>

              <div className="my-4 flex flex-col gap-2">
                <div className="flex justify-center gap-4 font-bold">
                  نام و نام خانوادگی:{" "}
                  <span className="font-medium text-[#444]">{invoice.Fullname}</span>
                </div>
                <div className="flex justify-center gap-4 font-bold">
                  شماره تماس: <span className="font-medium text-[#444]">{invoice.Phonenumber}</span>
                </div>
                <div className="my-6">
                  تاریخ صدور: <span>{formatDateTime(invoice.Date)}</span>
                </div>
                <div>
                  وضعیت: <span>{invoice.Checked ? "تایید شده" : "در انتظار تایید"}</span>
                </div>
                <div>
                  تعداد کل اقلام: <span>{invoice.TotalAmount}</span>
                </div>
              </div>
            </div>

            <table className="mb-8 w-full border-collapse overflow-hidden rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
              <thead>
                <tr>
                  <th className="border border-[#eaeaea] bg-[#003262] p-3 text-start font-semibold text-white">
                    محصول
                  </th>
                  <th className="border border-[#eaeaea] bg-[#003262] p-3 text-start font-semibold text-white">
                    قیمت نهایی
                  </th>
                  <th className="border border-[#eaeaea] bg-[#003262] p-3 text-start font-semibold text-white">
                    وضعیت گارانتی
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.Invoice_Details.map((product, index) => {
                  const detailId = product.Invoice_Details || product.ProductId || index;
                  const lookupKey = typeof detailId === "number" ? detailId : index;
                  const warranty = warranties[lookupKey];
                  const warrantyStyling = warranty ? formatWarrantyStatus(warranty.status) : null;

                  return (
                    <tr key={product.ProductId} className="even:bg-[#f9f9f9] hover:bg-[#f1f1f1]">
                      <td className="border border-[#eaeaea] p-3">
                        {productNames[product.ProductId] || "در حال بارگذاری..."}
                      </td>
                      <td className="border border-[#eaeaea] p-3">
                        {formatCurrency(product.total_price)}
                      </td>
                      <td className="border border-[#eaeaea] p-3">
                        {warranty ? (
                          <div className="rounded-[6px] bg-[#f8f8f8] p-2 text-[0.9rem] leading-[1.6]">
                            <div className="mb-1">
                              <strong className="ms-1 text-[#003262]">کد گارانتی:</strong>{" "}
                              {warranty.warrantycode}
                            </div>
                            <div className="mb-1">
                              <strong className="ms-1 text-[#003262]">وضعیت:</strong>
                              <span
                                className={`ms-2 inline-block rounded-[4px] p-1 px-2 text-[0.8rem] font-semibold ${warrantyStyling?.className}`}
                              >
                                {warrantyStyling?.text}
                              </span>
                            </div>
                            {warranty.startdate && warranty.expirydate && (
                              <div>
                                <strong className="ms-1 text-[#003262]">اعتبار:</strong>
                                <span>{formatPersianDate(warranty.startdate)}</span>
                                {" تا "}
                                <span>{formatPersianDate(warranty.expirydate)}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block rounded-[4px] bg-[#f5f5f5] p-1 px-2 text-[0.9rem] text-[#757575] italic">
                            گارانتی ثبت نشده
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-4 md:flex-row lg:flex-row xl:flex-row 2xl:flex-row">
          <button
            type="button"
            onClick={handleDownload}
            title="دانلود فاکتور"
            className="cursor-pointer rounded-lg border-none bg-[#003262] px-6 py-3 text-base font-semibold text-white transition-[transform,background-color] duration-200 hover:-translate-y-[2px] hover:bg-[#0e6aff] md:w-auto lg:w-auto xl:w-auto 2xl:w-auto"
          >
            دانلود فاکتور
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-lg border-none bg-[#f0f0f0] px-6 py-3 text-base font-semibold text-[#333] transition-[transform,background-color] duration-200 hover:-translate-y-[2px] hover:bg-[#e0e0e0] md:w-auto lg:w-auto xl:w-auto 2xl:w-auto"
            onClick={onClose}
            title="بستن"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
