"use client";

import { useInvoice } from "@/context/InvoiceContext";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { FaRegTrashAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import styles from "../../ProductPage.module.css";
import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate"; // Ensure the helper is correctly imported

interface Props {
  ProductId: number;
  ProductName: string;
  productPrice: string | null; // USD price, can be null
  productDiscount: string; // USD discount
}

const ClientInvoiceSection = ({
  ProductId,
  ProductName,
  productPrice,
  productDiscount,
}: Props) => {
  const { addProductToInvoice, getProductQuantity, removeProductFromInvoice } =
    useInvoice();
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
  const e2p = (s: string): string =>
    s.replace(/\d/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);

  // Convert price and discount to numbers
  const priceUsd = productPrice
    ? parseFloat(productPrice.replace(/,/g, ""))
    : 0;
  const discountUsd = productDiscount
    ? parseFloat(productDiscount.replace(/,/g, ""))
    : 0;

  // Convert USD to Rial
  const priceInRial = exchangeRate ? priceUsd * exchangeRate : null;
  const discountInRial = exchangeRate ? discountUsd * exchangeRate : null;
  const discountedPrice =
    priceInRial && discountInRial ? priceInRial - discountInRial : null;
  const discountPercentage =
    priceInRial && discountInRial
      ? ((discountInRial / priceInRial) * 100).toFixed(0)
      : 0;

  // Handle cases where the product price is not available or fetching the exchange rate fails
  if (!productPrice || +productPrice === 0 || exchangeRate === null) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-blue-100 p-3 rounded-lg text-center gap-5 my-6">
        <p className="text-lg text-blue-950 font-bold">
          {exchangeRate === null
            ? "درحال دریافت نرخ تبدیل دلار به تومان..."
            : "این محصول امکان ثبت فاکتور از طریق سایت ندارد، لطفا با بخش فروش تماس بگیرید."}
        </p>
        <Link
          href="tel:02177500008"
          className="bg-blue-600 text-white py-2 px-4 rounded-lg text-base md:text-lg hover:bg-blue-700 transition-all animate-fade-in"
        >
          تماس با بخش فروش
        </Link>
      </div>
    );
  }

  // Render loading state
  if (loading || isFetchingRate) {
    return (
      <div className="w-full bg-gray-200 animate-pulse p-2 flex justify-center text-slate-800 rounded-lg mt-6 sm:mt-0 text-sm md:text-base">
        درحال بارگذاری...
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

  // Price display block (used for all logged in users)
  const priceBlock = (
    <div
      className={`flex ${styles.priceParent} flex-col gap-3 my-6 bg-blue-100 p-3 rounded-lg max-w-full animate-fade-in`}
    >
      <div className="flex items-center gap-2 content-center">
        قیمت قبلی:{" "}
        <span
          className={`${styles.beforePrice} font-extralight text-gray-500 line-through`}
        >
          {e2p(priceInRial?.toLocaleString() || "0")} تومان
        </span>
        {discountInRial && discountInRial > 0 && (
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
        <div className="w-full flex flex-col items-center justify-center bg-blue-100 p-3 rounded-lg text-center gap-3 my-6">
          <p className="text-lg text-blue-950 font-bold">
            برای ثبت این محصول داخل فاکتور وارد پنل خود شوید و از آنجا انتخاب
            کنید
          </p>

          {isAdmin && (
            <Link
              href="/admin/invoices"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg text-base md:text-lg hover:bg-blue-700 transition-all animate-fade-in"
            >
              رفتن به پنل مدیریت
            </Link>
          )}
          {isBranch && (
            <Link
              href="/admin/branches/my"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg text-base md:text-lg hover:bg-blue-700 transition-all animate-fade-in"
            >
              رفتن به پنل شعبه
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Render for regular users
  return (
    <div className={styles.invoiceParent}>
      {priceBlock}

      {currentQuantity > 0 && (
        <p className={styles.invoiceText}>تعداد این محصول در فاکتور</p>
      )}

      <div className={styles.addToInvoice}>
        {currentQuantity > 0 ? (
          <div className={styles.actions}>
            <button
              className={styles.action}
              onClick={() =>
                addProductToInvoice(
                  ProductId,
                  1,
                  ProductName,
                  priceInRial!,
                  discountInRial!
                )
              }
            >
              +
            </button>
            {!!currentQuantity && (
              <div className={styles.invoiceAmount}>{currentQuantity}</div>
            )}
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
                  addProductToInvoice(
                    ProductId,
                    -1,
                    ProductName,
                    priceInRial!,
                    discountInRial!
                  )
                }
              >
                -
              </button>
            )}
          </div>
        ) : (
          <button
            className="w-full bg-[#003262] p-2 flex justify-center text-white rounded-lg sm:mt-0 text-sm md:text-base"
            onClick={() =>
              addProductToInvoice(
                ProductId,
                1,
                ProductName,
                priceInRial!,
                discountInRial!
              )
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
    </div>
  );
};

export default ClientInvoiceSection;
