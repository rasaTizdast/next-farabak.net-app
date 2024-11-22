import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import logo from "../../../../../../../public/Farabak_Logo.webp";

import styles from "./InvoiceDetails.module.css";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  amount: number;
};

type Props = {
  onClose: () => void;
  invoice: {
    guid: string;
    fullname: string;
    phonenumber: string;
    totalAmount: string;
    products: Product[];
  };
};

const InvoiceDetails = ({ invoice, onClose }: Props) => {
  const componentRef = useRef();

  const handleDownload = () => {
    const input = componentRef.current;

    html2canvas(input, { scale: 3 }).then((canvas) => {
      // Increased scale for better quality
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

      pdf.save(`فاکتور#${invoice.guid} - فرابک.pdf`);
    });
  };

  if (!invoice) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>جزئیات فاکتور {invoice.guid}</h2>
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
            <h3>فاکتور #{invoice.guid}</h3>

            <div className={styles.userDetails}>
              <div className={styles.name}>
                نام و نام خانوادگی: <span>{invoice.fullname}</span>
              </div>
              <div className={styles.phoneNumber}>
                شماره کاربر:
                <span>{invoice.phonenumber}</span>
              </div>
            </div>
            <div className={styles.date}>
              <h4>تاریخ ثبت فاکتور:</h4>
              {invoice.date}
            </div>
            <p>
              مجموع محصولات: <strong>{invoice.totalAmount}</strong>
            </p>
          </div>
          <table className={styles.invoiceTable}>
            <thead>
              <tr>
                <th>محصول</th>
                <th>تعداد</th>
              </tr>
            </thead>
            <tbody>
              {invoice.products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
