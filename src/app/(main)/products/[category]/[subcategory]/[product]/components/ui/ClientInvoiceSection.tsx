"use client";

import { useInvoice } from "@/context/InvoiceContext";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { FaRegTrashAlt } from "react-icons/fa";
import styles from "../../ProductPage.module.css";

interface Props {
  ProductId:number;
  ProductName:string
}

const ClientInvoiceSection = ({ ProductId, ProductName}:Props) => {
  const { addProductToInvoice, getProductQuantity, removeProductFromInvoice } =
    useInvoice();
  const { user, loading } = useUser();

  // Get the current quantity of the product in the invoice
  const currentQuantity = getProductQuantity(ProductId);

  // Handlers for adding and removing products
  const handleAddProduct = () => addProductToInvoice(ProductId, 1, ProductName);
  const handleRemoveProduct = () => {
    if (currentQuantity === 1) {
      removeProductFromInvoice(ProductId);
    } else {
      addProductToInvoice(ProductId, -1, ProductName);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="w-full bg-gray-200 animate-pulse p-2 flex justify-center text-slate-800 rounded-lg mt-6 sm:mt-0 text-sm md:text-base">
        درحال بارگذاری
      </div>
    );
  }

  // Render if user is not logged in
  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="w-full bg-[#003262] p-2 flex justify-center text-white rounded-lg mt-6 sm:mt-0 text-sm md:text-base"
      >
        برای ثبت فاکتور وارد شوید
      </Link>
    );
  }

  // Render the invoice actions if the user is logged in
  return (
    <div className={styles.invoiceParent}>
      {currentQuantity > 0 && (
        <p className={styles.invoiceText}>تعداد این محصول در فاکتور</p>
      )}

      <div className={styles.addToInvoice}>
        {currentQuantity > 0 ? (
          <div className={styles.actions}>
            <button className={styles.action} onClick={handleAddProduct}>
              +
            </button>
            {!!currentQuantity && (
              <div className={styles.invoiceAmount}>{currentQuantity}</div>
            )}
            {currentQuantity === 1 ? (
              <button onClick={handleRemoveProduct} className={styles.action}>
                <FaRegTrashAlt />
              </button>
            ) : (
              <button className={styles.action} onClick={handleRemoveProduct}>
                -
              </button>
            )}
          </div>
        ) : (
          <button
            className="w-full bg-[#003262] p-2 flex justify-center text-white rounded-lg mt-6 sm:mt-0 text-sm md:text-base"
            onClick={handleAddProduct}
          >
            اضافه کردن به فاکتور
          </button>
        )}
      </div>

      {!!currentQuantity && (
        <p className={styles.invoiceText2}>
          این محصول به
          <Link href="/dashboard/new-invoice"> فاکتور جدید </Link>
          شما اضافه شد
        </p>
      )}
    </div>
  );
};

export default ClientInvoiceSection;
