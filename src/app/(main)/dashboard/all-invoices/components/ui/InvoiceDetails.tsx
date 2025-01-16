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
  discount: number;
  ProductId: number;
  quantity: number;
  total_price: number;
};

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
  const [loading, setLoading] = useState(true);

  console.log(invoice.Invoice_Details);

  // Helper function to format the date and time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}/${month}/${day} | ${hours}:${minutes}:${seconds}`;
  };

  // Fetch product names
  useEffect(() => {
    const fetchProductNames = async () => {
      try {
        const productNameRequests = invoice.Invoice_Details.map((product) =>
          axios
            .get(`/api/products/getProductType/${product.ProductId}`)
            .then((res) => ({
              id: product.ProductId,
              name: res.data.productType,
            }))
        );

        const results = await Promise.all(productNameRequests);
        const names = results.reduce(
          (acc, curr) => ({ ...acc, [curr.id]: curr.name }),
          {}
        );

        setProductNames(names);
      } catch (error) {
        console.error("Error fetching product names:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchProductNames();
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

      pdf.save(`فاکتور#${invoice.FactorGuid} - فرابک.pdf`);
    });
  };

  if (!invoice) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>جزئیات فاکتور {invoice.FactorGuid}</h2>

        {loading ? (
          // Skeleton Loader while loading data
          <div className="p-8 space-y-4">
            <div className="w-48 h-6 bg-gray-300 animate-pulse rounded-md"></div>
            <div className="w-32 h-4 bg-gray-300 animate-pulse rounded-md"></div>
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
                alt="farabak Logo"
                width={2066}
                height={182}
                quality={100}
              />
            </div>
            <div className={styles.invoiceHeader}>
              <h3>فاکتور #{invoice.FactorGuid}</h3>

              <div className={styles.userDetails}>
                <div className={styles.name}>
                  نام و نام خانوادگی: <span>{invoice.Fullname}</span>
                </div>
                <div className={styles.phoneNumber}>
                  شماره کاربر: <span>{invoice.Phonenumber}</span>
                </div>
              </div>
              <div className={styles.date}>
                <h4 className="font-bold mt-4">تاریخ ثبت فاکتور:</h4>
                <span dir="ltr">{formatDateTime(invoice.Date)}</span>
              </div>
              <p>
                مجموع محصولات: <strong>{invoice.TotalAmount}</strong>
              </p>
            </div>
            <table className={styles.invoiceTable}>
              <thead>
                <tr>
                  <th>محصول</th>
                  <th>قیمت واحد - تومان</th>
                  <th>تعداد</th>
                  <th>قیمت نهایی (با تخفیف) - تومان</th>
                </tr>
              </thead>
              <tbody>
                {invoice.Invoice_Details.map((product) => (
                  <tr key={product.ProductId}>
                    <td>
                      {productNames[product.ProductId] || "در حال بارگذاری..."}
                    </td>
                    <td>{product.price}</td>
                    <td>{product.quantity}</td>
                    <td>{product.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className={styles.actions}>
          <button className={styles.downloadButton} onClick={handleDownload}>
            دانلود
          </button>
          <button className={styles.closeButton} onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
