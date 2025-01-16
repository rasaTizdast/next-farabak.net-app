"use client";

import { useInvoice } from "@/context/InvoiceContext";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { FaRegTrashAlt } from "react-icons/fa";
import styles from "../../ProductPage.module.css";

interface Props {
  ProductId: number;
  ProductName: string;
  productPrice: string | null; // Allow null for unavailable products
  productDiscount: string; // Allow null for unavailable products
}

const ClientInvoiceSection = ({
  ProductId,
  ProductName,
  productPrice,
  productDiscount,
}: Props) => {
  const { addProductToInvoice, getProductQuantity, removeProductFromInvoice } =
    useInvoice();
  const { user, loading } = useUser();

  // Get the current quantity of the product in the invoice
  const currentQuantity = getProductQuantity(ProductId);

  // Handle unavailable product
  if (!productPrice || +productPrice === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-blue-100 p-3 rounded-lg text-center gap-5 my-6">
        <p className="text-lg text-blue-950 font-bold">
          این محصول امکان ثبت فاکتور از طریق سایت ندارد، لطفا با بخش فروش تماس
          بگیرید.
        </p>
        <Link
          href="tel:02122089531"
          className="bg-blue-600 text-white py-2 px-4 rounded-lg text-base md:text-lg hover:bg-blue-700 transition-all animate-fade-in"
        >
          تماس با بخش فروش
        </Link>
      </div>
    );
  }

  // Handlers for adding and removing products
  const handleAddProduct = () =>
    addProductToInvoice(
      ProductId,
      1,
      ProductName,
      +productPrice,
      +productDiscount
    );
  const handleRemoveProduct = () => {
    if (currentQuantity === 1) {
      removeProductFromInvoice(ProductId);
    } else {
      addProductToInvoice(
        ProductId,
        -1,
        ProductName,
        +productPrice,
        +productDiscount
      );
    }
  };

  // Convert English digits to Persian digits
  const e2p = (s: string): string =>
    s.replace(/\d/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);

  // Convert price and discount to numbers for calculations
  const price = parseFloat(productPrice.replace(/,/g, ""));
  const discount = productDiscount
    ? parseFloat(productDiscount.replace(/,/g, ""))
    : 0;

  // Calculate the discounted price
  const discountedPrice = price - discount;

  // Calculate the discount percentage
  const discountPercentage =
    discount > 0 ? ((discount / price) * 100).toFixed(0) : 0;

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
      {/* Minimal Price and Discount Section */}
      <div
        className={`flex ${styles.priceParent} flex-col gap-3 my-6 bg-blue-100 p-3 rounded-lg max-w-full animate-fade-in`}
      >
        <div className="flex items-center gap-2 content-center">
          قیمت قبلی:{" "}
          <span
            className={`${styles.beforePrice} font-extralight text-gray-500 line-through`}
          >
            {e2p(price.toLocaleString())} ریال
          </span>
          {discount > 0 && (
            <span
              className={`${styles.discount} text-xs bg-[#003262] text-white py-1 px-2 rounded-lg lg:rounded-xl font-semibold`}
            >
              {discountPercentage}%
            </span>
          )}
        </div>
        <div className="flex items-center content-center gap-2">
          قیمت جدید:{" "}
          <span className="text-2xl font-black text-[#003262]">
            {e2p(discountedPrice.toLocaleString())} ریال
          </span>
        </div>
      </div>

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
            className="w-full bg-[#003262] p-2 flex justify-center text-white rounded-lg sm:mt-0 text-sm md:text-base"
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
