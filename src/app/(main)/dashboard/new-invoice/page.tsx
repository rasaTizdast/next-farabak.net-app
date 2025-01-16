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
        toast.success("فاکتور شما با موفقیت اضافه شد!");
        clearInvoice(); // Clear the invoice after a successful post
      }
    } catch (error) {
      toast.error("پروسه اضافه شدن فاکتور با شکست مواجه شد، دوباره تلاش کنید!");
      console.error(error);
    }
  };

  console.log(invoice);

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className={styles.container}>
        <h1 className={styles.header}>ثبت فاکتور جدید</h1>

        <table className={styles.invoiceTable}>
          <thead>
            <tr>
              <th>نام محصول</th>
              <th>قیمت واحد</th>
              <th>تعداد</th>
              <th>مجموع قیمت</th>
              <th>تخفیف</th>
              <th>قیمت نهایی</th>
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
              invoice.products.map((product) => (
                <tr key={product.ProductId}>
                  <td>{product.ProductName}</td>
                  <td>{product.Price}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={product.Quantity}
                      onChange={(e) =>
                        handleQuantityChange(product.ProductId, e.target.value)
                      }
                      className={styles.quantityInput}
                    />
                  </td>
                  <td>{product.Price * product.Quantity}</td>
                  <td>{product.Discount * product.Quantity}</td>
                  <td>{product.Price * product.Quantity - product.Discount * product.Quantity}</td>
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
              ))
            )}
          </tbody>
        </table>

        <div className={styles.actions}>
          <p className={styles.total}>
            تعداد کل محصولات: {invoice.TotalAmount}
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
