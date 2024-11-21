"use client";

import { addNewInvoice } from "@/helpers/invoiceHandlers";
import { useUser } from "@/context/UserContext";
import { useInvoice } from "@/context/InvoiceContext";
import styles from "./NewInvoice.module.css";
import toast, { Toaster } from "react-hot-toast";

const NewInvoicePage = () => {
  const {
    invoice,
    removeProductFromInvoice,
    updateProductQuantity,
    clearInvoice,
  } = useInvoice();
  const { user } = useUser();

  const handleQuantityChange = (productName: string, newQuantity: string) => {
    const parsedQuantity = parseInt(newQuantity, 10) || 0; // Ensure it's a number
    if (parsedQuantity >= 0) {
      // Validate quantity is non-negative
      updateProductQuantity(productName, parsedQuantity);
    }
  };

  const addNewInvoiceHandler = async () => {
    try {
      const response = await addNewInvoice(invoice, user);
      if (response) {
        toast.success("فاکتور شما با موفقیت اضافه شد!");
        clearInvoice(); // Clear the invoice after a successful post
      }
    } catch (error) {
      toast.error("پروسه اضافه شدن فاکتور با شکست مواجه شد، دوباره تلاش کنید!");
      console.error(error);
    }
  };

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className={styles.container}>
        <h1 className={styles.header}>ثبت فاکتور جدید</h1>

        <table className={styles.invoiceTable}>
          <thead>
            <tr>
              <th>نام محصول</th>
              <th>تعداد</th>
              <th>عملیات‌ها</th>
            </tr>
          </thead>
          <tbody>
            {invoice.products.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>
                  فعلا محصولی داخل فاکتور شما نیست!
                </td>
              </tr>
            ) : (
              invoice.products.map((product) => (
                <tr key={product.name}>
                  <td>{product.name}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={product.amount}
                      onChange={(e) =>
                        handleQuantityChange(product.name, e.target.value)
                      }
                      className={styles.quantityInput}
                    />
                  </td>
                  <td>
                    <button
                      className={styles.clearButton}
                      onClick={() => removeProductFromInvoice(product.name)}
                    >
                      حذف محصول
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className={styles.actions}>
          <p className={styles.total}>تعداد کل محصولات: {invoice.totalItems}</p>
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
