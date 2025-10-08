"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";

import { useInvoice } from "@/context/InvoiceContext";
import { useUser } from "@/context/UserContext";
import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate"; // Ensure the helper is correctly imported

import styles from "../../ProductPage.module.css";

interface Props {
  ProductId: number;
  ProductName: string;
  productPrice: string | null; // USD price, can be null
  productDiscount: string; // USD discount
}

const ClientInvoiceSection = ({ ProductId, ProductName, productPrice, productDiscount }: Props) => {
  const { addProductToInvoice, getProductQuantity, removeProductFromInvoice } = useInvoice();
  const { user, loading, isAdmin, isBranch } = useUser();
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isFetchingRate, setIsFetchingRate] = useState(true);

  useEffect(() => {
    const getExchangeRate = async () => {
      setIsFetchingRate(true);
      const rate = await fetchUsdToRialRate();
      setExchangeRate(rate);
      setIsFetchingRate(false);
    };
    getExchangeRate();
  }, []);

  // Get the current quantity of the product in the invoice
  const currentQuantity = getProductQuantity(ProductId);

  // Convert English digits to Persian digits
  const e2p = (s: string): string => s.replace(/\d/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);

  // Convert price and discount to numbers
  const priceUsd = productPrice ? parseFloat(productPrice.replace(/,/g, "")) : 0;
  const discountUsd = productDiscount ? parseFloat(productDiscount.replace(/,/g, "")) : 0;

  // Convert USD to Rial
  const priceInRial = exchangeRate ? priceUsd * exchangeRate : null;
  const discountInRial = exchangeRate ? discountUsd * exchangeRate : null;
  const discountedPrice = priceInRial && discountInRial ? priceInRial - discountInRial : null;
  const discountPercentage =
    priceInRial && discountInRial ? ((discountInRial / priceInRial) * 100).toFixed(2) : 0;

  // Handle cases where the product price is not available or fetching the exchange rate fails
  if (!productPrice || +productPrice === 0 || exchangeRate === null) {
    return (
      <div className="my-6 flex w-full flex-col items-center justify-center gap-5 rounded-lg bg-blue-100 p-3 text-center">
        <p className="text-lg font-bold text-blue-950">
          {exchangeRate === null
            ? "درحال دریافت نرخ تبدیل دلار به تومان..."
            : "این محصول امکان ثبت فاکتور از طریق سایت ندارد، لطفا با بخش فروش تماس بگیرید."}
        </p>
        <Link
          href="tel:02177500008"
          className="animate-fade-in rounded-lg bg-blue-600 px-4 py-2 text-base text-white transition-all hover:bg-blue-700 md:text-lg"
        >
          تماس با بخش فروش
        </Link>
      </div>
    );
  }

  // Render loading state
  if (loading || isFetchingRate) {
    return (
      <div className="mt-6 flex w-full animate-pulse justify-center rounded-lg bg-gray-200 p-2 text-sm text-slate-800 sm:mt-0 md:text-base">
        درحال بارگذاری...
      </div>
    );
  }

  // Price display block (used for all logged in users)
  const priceBlock = (
    <div
      className={`flex ${styles.priceParent} my-6 max-w-full animate-fade-in flex-col gap-3 rounded-lg bg-blue-100 p-3`}
    >
      <div className="flex content-center items-center gap-2">
        قیمت قبلی:{" "}
        <span className={`${styles.beforePrice} font-extralight text-gray-500 line-through`}>
          {e2p(priceInRial?.toLocaleString() || "0")} تومان
        </span>
        {discountInRial && discountInRial > 0 && (
          <span
            className={`${styles.discount} rounded-lg bg-[#003262] px-2 py-1 text-xs font-semibold text-white lg:rounded-xl`}
          >
            {e2p(discountPercentage?.toLocaleString() || "0")}%
          </span>
        )}
      </div>
      <div className="flex content-center items-center gap-2">
        قیمت جدید:{" "}
        <span className="text-2xl font-black text-[#003262]">
          {e2p(discountedPrice?.toLocaleString() || "0")} تومان
        </span>
      </div>
    </div>
  );

  // Render for admin or branch users - show price block first, then special message
  if (isAdmin || isBranch) {
    return (
      <div className={styles.invoiceParent}>
        {priceBlock}
        <div className="my-6 flex w-full flex-col items-center justify-center gap-3 rounded-lg bg-blue-100 p-3 text-center">
          <p className="text-lg font-bold text-blue-950">
            برای ثبت این محصول داخل فاکتور وارد پنل خود شوید و از آنجا انتخاب کنید
          </p>

          {isAdmin && (
            <Link
              href="/admin/invoices"
              className="animate-fade-in rounded-lg bg-blue-600 px-4 py-2 text-base text-white transition-all hover:bg-blue-700 md:text-lg"
            >
              رفتن به پنل مدیریت
            </Link>
          )}
          {isBranch && (
            <Link
              href="/admin/branches/my"
              className="animate-fade-in rounded-lg bg-blue-600 px-4 py-2 text-base text-white transition-all hover:bg-blue-700 md:text-lg"
            >
              رفتن به پنل شعبه
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Render for regular users (and guests)
  return (
    <div className={styles.invoiceParent}>
      {priceBlock}

      {!user ? (
        <Link
          href="/auth/login"
          className="flex w-full justify-center rounded-lg bg-[#003262] p-2 text-sm text-white sm:mt-0 md:text-base"
        >
          برای ثبت فاکتور وارد شوید
        </Link>
      ) : (
        <>
          {currentQuantity > 0 && <p className={styles.invoiceText}>تعداد این محصول در فاکتور</p>}
          <div className={styles.addToInvoice}>
            {currentQuantity > 0 ? (
              <div className={styles.actions}>
                <button
                  className={styles.action}
                  onClick={() =>
                    addProductToInvoice(ProductId, 1, ProductName, priceInRial!, discountInRial!)
                  }
                >
                  +
                </button>
                {!!currentQuantity && <div className={styles.invoiceAmount}>{currentQuantity}</div>}
                {currentQuantity === 1 ? (
                  <button
                    onClick={() => removeProductFromInvoice(ProductId)}
                    className={styles.action}
                  >
                    <FaRegTrashAlt />
                  </button>
                ) : (
                  <button
                    className={styles.action}
                    onClick={() =>
                      addProductToInvoice(ProductId, -1, ProductName, priceInRial!, discountInRial!)
                    }
                  >
                    -
                  </button>
                )}
              </div>
            ) : (
              <button
                className="flex w-full justify-center rounded-lg bg-[#003262] p-2 text-sm text-white sm:mt-0 md:text-base"
                onClick={() =>
                  addProductToInvoice(ProductId, 1, ProductName, priceInRial!, discountInRial!)
                }
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
        </>
      )}
    </div>
  );
};

export default ClientInvoiceSection;
