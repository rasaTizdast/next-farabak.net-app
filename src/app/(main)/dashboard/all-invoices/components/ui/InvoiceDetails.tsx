import { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import logo from "../../../../../../../public/Farabak_Logo.webp";
import styles from "./InvoiceDetails.module.css";
import Image from "next/image";

type Product = {
  Invoiceid: string;
  price: number;
  discount?: number;
  ProductId: number;
  quantity: number;
  total_price: number;
  Invoice_Details: number;
};

// Add warranty type
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

const InvoiceDetails = ({ invoice, onClose }: Props) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [productNames, setProductNames] = useState<{ [key: number]: string }>(
    {}
  );
  // Add state for warranties
  const [warranties, setWarranties] = useState<{ [key: number]: Warranty }>({});
  const [loading, setLoading] = useState(true);

  // Helper function to format the date and time
  const formatDateTime = (isoString: string) => {
    try {
      // Handle Jalali dates in ISO format (e.g. "1404-04-07T21:04:51" or "1404-04-7T21:04:51")
      if (isoString && isoString.includes("T")) {
        const [datePart, timePart] = isoString.split("T");
        const [year, month, day] = datePart.split("-");
        const [hour, minute] = timePart.split(":").slice(0, 2);

        // Make sure to handle single digit days by explicitly parsing as integers
        return `${year}/${month}/${day} | ${hour}:${minute}`;
      }

      // Fallback to standard Date parsing for non-Jalali dates
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
      return isoString || "تاریخ نامشخص";
    }
  };

  // Helper function to format date to Persian format
  const formatPersianDate = (isoString: string) => {
    try {
      // Handle Jalali dates in ISO format (e.g. "1404-04-07T21:04:51" or "1404-04-7T21:04:51")
      if (isoString && isoString.includes("T")) {
        const [datePart] = isoString.split("T");
        const [year, month, day] = datePart.split("-");

        // Ensure we have proper formatting with zero-padded month and day
        const formattedMonth = month.padStart(2, "0");
        const formattedDay = day.padStart(2, "0");

        return `${year}/${formattedMonth}/${formattedDay}`;
      }

      // Fallback to standard Date parsing for non-Jalali dates
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
      return isoString || "تاریخ نامشخص";
    }
  };

  // Fetch product names and warranties
  useEffect(() => {
    const fetchData = async () => {
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

        const warrantyRequests = invoice.Invoice_Details.map(
          (product, index) => {
            // Make sure we have a valid Invoice_Details ID
            const detailId = product.Invoice_Details || null;
            // Use a predictable key for storing the warranty data
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
                console.error(
                  `Error fetching warranty for detail ID ${detailId}:`,
                  error
                );
                return {
                  id: lookupKey,
                  warranty: null,
                };
              });
          }
        );

        const [productResults, warrantyResults] = await Promise.all([
          Promise.all(productNameRequests),
          Promise.all(warrantyRequests),
        ]);

        const names = productResults.reduce(
          (acc, curr) => ({ ...acc, [curr.id]: curr.name }),
          {}
        );

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
    };

    fetchData();
  }, [invoice.Invoice_Details]);

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

  // Helper function to format warranty status
  const formatWarrantyStatus = (status: string) => {
    switch (status) {
      case "Active":
        return { text: "فعال", className: styles.statusActive };
      case "Expired":
        return { text: "منقضی شده", className: styles.statusExpired };
      case "Requested":
        return { text: "درخواست شده", className: styles.statusRequested };
      default:
        return { text: status, className: "" };
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  if (!invoice) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {loading ? (
          // Skeleton Loader while loading data
          <div className="p-8 space-y-4">
            <div className="w-48 h-6 bg-gray-300 animate-pulse rounded-md mx-auto"></div>
            <div className="w-32 h-4 bg-gray-300 animate-pulse rounded-md mx-auto"></div>
            <div className="w-full h-6 bg-gray-300 animate-pulse rounded-md"></div>
            <div className="w-full h-6 bg-gray-300 animate-pulse rounded-md"></div>
            <div className="w-full h-2 bg-gray-300 animate-pulse rounded-md"></div>
            <div className="w-full h-48 bg-gray-300 animate-pulse rounded-md"></div>
          </div>
        ) : (
          <div ref={componentRef} className={styles.invoice} dir="rtl">
            <div className={styles.invoiceLogo}>
              <Image
                src={logo}
                alt="لوگوی فرابک"
                width={2066}
                height={182}
                quality={100}
                priority
              />
            </div>
            <div className={styles.invoiceHeader}>
              <h3>فاکتور شماره: {invoice.FactorGuid}</h3>

              <div className={styles.userDetails}>
                <div className={styles.name}>
                  نام و نام خانوادگی: <span>{invoice.Fullname}</span>
                </div>
                <div className={styles.phoneNumber}>
                  شماره تماس: <span>{invoice.Phonenumber}</span>
                </div>
                <div className={styles.date}>
                  تاریخ صدور: <span>{formatDateTime(invoice.Date)}</span>
                </div>
                <div>
                  وضعیت:{" "}
                  <span>
                    {invoice.Checked ? "تایید شده" : "در انتظار تایید"}
                  </span>
                </div>
                <div>
                  تعداد کل اقلام: <span>{invoice.TotalAmount}</span>
                </div>
              </div>
            </div>

            <table className={styles.invoiceTable}>
              <thead>
                <tr>
                  <th>محصول</th>
                  <th>قیمت نهایی</th>
                  <th>وضعیت گارانتی</th>
                </tr>
              </thead>
              <tbody>
                {invoice.Invoice_Details.map((product, index) => {
                  // Generate a consistent key for the warranty lookup
                  const detailId =
                    product.Invoice_Details || product.ProductId || index;
                  const lookupKey =
                    typeof detailId === "number" ? detailId : index;
                  const warranty = warranties[lookupKey];
                  const warrantyStyling = warranty
                    ? formatWarrantyStatus(warranty.status)
                    : null;

                  return (
                    <tr key={`${product.ProductId}-${index}`}>
                      <td>
                        {productNames[product.ProductId] ||
                          "در حال بارگذاری..."}
                      </td>
                      <td>{formatCurrency(product.total_price)}</td>
                      <td>
                        {warranty ? (
                          <div className={styles.warrantyInfo}>
                            <div>
                              <strong>کد گارانتی:</strong>{" "}
                              {warranty.warrantycode}
                            </div>
                            <div>
                              <strong>وضعیت:</strong>
                              <span
                                className={`${styles.statusTag} ${warrantyStyling?.className}`}
                              >
                                {warrantyStyling?.text}
                              </span>
                            </div>
                            {warranty.startdate && warranty.expirydate && (
                              <div>
                                <strong>اعتبار:</strong>
                                <span>
                                  {formatPersianDate(warranty.startdate)}
                                </span>
                                {" تا "}
                                <span>
                                  {formatPersianDate(warranty.expirydate)}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={styles.noWarranty}>
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
        <div className={styles.actions}>
          <button
            className={styles.downloadButton}
            onClick={handleDownload}
            title="دانلود فاکتور"
          >
            دانلود فاکتور
          </button>
          <button className={styles.closeButton} onClick={onClose} title="بستن">
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
