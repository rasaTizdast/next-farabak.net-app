"use client";

export const dynamic = "force-dynamic";

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
              <th>قیمت واحد - ریال</th>
              <th>تعداد</th>
              <th>مجموع قیمت - ریال</th>
              <th>تخفیف - ریال</th>
              <th>قیمت نهایی - ریال</th>
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
              invoice.products.map((product) => {
                // Safeguard for undefined properties
                const price = product.Price ?? 0;
                const discount = product.Discount ?? 0;
                const quantity = product.Quantity ?? 0;

                return (
                  <tr key={product.ProductId}>
                    <td>{product.ProductName}</td>
                    <td>{price}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            product.ProductId,
                            e.target.value
                          )
                        }
                        className={styles.quantityInput}
                      />
                    </td>
                    <td>{price * quantity}</td>
                    <td>{discount * quantity}</td>
                    <td>{price * quantity - discount * quantity}</td>
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
                );
              })
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
