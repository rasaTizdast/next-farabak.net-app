"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaRegTrashAlt, FaInfoCircle, FaArrowUp, FaArrowDown, FaCheckCircle } from "react-icons/fa";

import { useInvoice } from "@/context/InvoiceContext";
import { useUser } from "@/context/UserContext";
import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";

import styles from "../../ProductPage.module.css";

interface Props {
  ProductId: number;
  ProductName: string;
  productPrice: string | null;
  productDiscount: string;
  minimumAmount?: number | null;
  maximumAmount?: number | null;
}

const ClientInvoiceSection = ({
  ProductId,
  ProductName,
  productPrice,
  productDiscount,
  minimumAmount,
  maximumAmount,
}: Props) => {
  const {
    addProductToInvoice,
    getProductQuantity,
    removeProductFromInvoice,
    updateProductQuantity,
  } = useInvoice();
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
  const discountInRial = exchangeRate && discountUsd > 0 ? discountUsd * exchangeRate : 0;

  // Calculate final price - if no discount, use original price
  const finalPrice = priceInRial && discountInRial > 0 ? priceInRial - discountInRial : priceInRial;

  // Only calculate discount percentage if there's an actual discount
  const discountPercentage =
    priceInRial && discountInRial > 0 ? ((discountInRial / priceInRial) * 100).toFixed(2) : 0;

  // Check if product has a meaningful discount
  const hasDiscount = discountInRial > 0;

  // Determine if product has limits
  const hasMinimum = minimumAmount !== null && minimumAmount !== undefined && minimumAmount > 0;
  const hasMaximum = maximumAmount !== null && maximumAmount !== undefined && maximumAmount > 0;
  const hasLimits = hasMinimum || hasMaximum;

  // Check if we're at the limits
  const canIncrease = !hasMaximum || currentQuantity < maximumAmount!;
  const isAtMinimum = hasMinimum && currentQuantity === minimumAmount;
  const isAtMaximum = hasMaximum && currentQuantity === maximumAmount;

  // Calculate progress percentage for visual indicator
  const progressPercentage =
    hasMaximum && currentQuantity > 0 ? Math.min((currentQuantity / maximumAmount!) * 100, 100) : 0;

  const handleQuantityChange = (delta: number) => {
    const intendedQuantity = currentQuantity + delta;
    updateProductQuantity(ProductId, intendedQuantity);
    // Context will:
    //   • snap to max if over
    //   • snap to min if under (but >0)
    //   • remove product if ≤0
  };

  // Handle initial add to invoice
  const handleInitialAdd = () => {
    const initialAmount = hasMinimum && minimumAmount! > 1 ? minimumAmount! : 1;
    addProductToInvoice(
      ProductId,
      initialAmount,
      ProductName,
      priceInRial!,
      discountInRial,
      minimumAmount ?? null,
      maximumAmount ?? null
    );
  };

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

  // Price display block - now with conditional rendering based on discount
  const priceBlock = (
    <div
      className={`flex ${styles.priceParent} my-6 max-w-full animate-fade-in flex-col gap-3 rounded-lg bg-blue-100 p-3`}
    >
      {hasDiscount ? (
        // Show before/after prices with discount badge
        <>
          <div className="flex content-center items-center gap-2">
            قیمت قبلی:{" "}
            <span className={`${styles.beforePrice} font-extralight text-gray-500 line-through`}>
              {e2p(priceInRial?.toLocaleString() || "0")} تومان
            </span>
            <span
              className={`${styles.discount} rounded-lg bg-[#003262] px-2 py-1 text-xs font-semibold text-white lg:rounded-xl`}
            >
              {e2p(discountPercentage?.toLocaleString() || "0")}%
            </span>
          </div>
          <div className="flex content-center items-center gap-2">
            قیمت جدید:{" "}
            <span className="text-2xl font-black text-[#003262]">
              {e2p(finalPrice?.toLocaleString() || "0")} تومان
            </span>
          </div>
        </>
      ) : (
        // Show only current price without discount styling
        <div className="flex content-center items-center gap-2">
          قیمت:{" "}
          <span className="text-2xl font-black text-[#003262]">
            {e2p(finalPrice?.toLocaleString() || "0")} تومان
          </span>
        </div>
      )}
    </div>
  );

  // Enhanced limits info with better design
  const limitsInfo = hasLimits && currentQuantity === 0 && (
    <div className="mb-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <FaInfoCircle className="text-lg text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="mb-2 text-sm font-bold text-blue-900">محدودیت سفارش این محصول</h4>
          <div className="flex flex-col gap-2">
            {hasMinimum && (
              <div className="flex items-center gap-2 text-xs">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <FaArrowDown className="text-xs text-green-600" />
                </div>
                <span className="text-slate-700">
                  حداقل مقدار سفارش:{" "}
                  <span className="font-bold text-green-700">
                    {e2p(minimumAmount!.toString())} عدد
                  </span>
                </span>
              </div>
            )}
            {hasMaximum && (
              <div className="flex items-center gap-2 text-xs">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
                  <FaArrowUp className="text-xs text-orange-600" />
                </div>
                <span className="text-slate-700">
                  حداکثر مقدار سفارش:{" "}
                  <span className="font-bold text-orange-700">
                    {e2p(maximumAmount!.toString())} عدد
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Active limits display when product is in cart
  const activeLimitsInfo = hasLimits && currentQuantity > 0 && (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between px-1 text-xs text-slate-600">
        <span>
          {hasMinimum && (
            <>
              حداقل:{" "}
              <span className="font-semibold text-green-700">{e2p(minimumAmount!.toString())}</span>
            </>
          )}
        </span>
        <span>
          {hasMaximum && (
            <>
              حداکثر:{" "}
              <span className="font-semibold text-orange-700">
                {e2p(maximumAmount!.toString())}
              </span>
            </>
          )}
        </span>
      </div>
      {hasMaximum && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAtMaximum
                ? "bg-gradient-to-r from-orange-500 to-red-500"
                : progressPercentage > 75
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                  : "bg-gradient-to-r from-green-400 to-blue-500"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
      {isAtMinimum && (
        <div className="mt-1 flex items-center gap-1 px-1 text-xs text-green-700">
          <FaCheckCircle className="text-xs" />
          <span>در حداقل مقدار مجاز</span>
        </div>
      )}
      {isAtMaximum && (
        <div className="mt-1 flex items-center gap-1 px-1 text-xs text-orange-700">
          <FaCheckCircle className="text-xs" />
          <span>در حداکثر مقدار مجاز</span>
        </div>
      )}
    </div>
  );

  // Render for admin or branch users
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
          {limitsInfo}
          {activeLimitsInfo}
          {currentQuantity > 0 && <p className={styles.invoiceText}>تعداد این محصول در فاکتور</p>}
          <div className={styles.addToInvoice}>
            {currentQuantity > 0 ? (
              <div className={styles.actions}>
                {/* + button */}
                <button type="button"
                  className={`${styles.action} origin-right transition-all ${
                    !canIncrease
                      ? "cursor-not-allowed bg-gray-300 opacity-50"
                      : "hover:bg-green-600 hover:brightness-110"
                  }`}
                  onClick={() => handleQuantityChange(1)}
                  disabled={!canIncrease}
                  title={
                    !canIncrease ? `حداکثر ${e2p(maximumAmount!.toString())} عدد` : "افزایش تعداد"
                  }
                >
                  +
                </button>

                <div className={`${styles.invoiceAmount} text-lg font-bold`}>
                  {e2p(currentQuantity.toString())}
                </div>

                {/* - button OR trash */}
                {currentQuantity <= (hasMinimum ? minimumAmount! : 1) ? (
                  <button type="button"
                    onClick={() => removeProductFromInvoice(ProductId)}
                    className={`${styles.action} origin-left transition-all hover:bg-red-600 hover:brightness-110`}
                    title="حذف کامل از فاکتور"
                  >
                    <FaRegTrashAlt />
                  </button>
                ) : (
                  <button type="button"
                    className={`${styles.action} origin-left transition-all hover:bg-yellow-600 hover:brightness-110`}
                    onClick={() => handleQuantityChange(-1)}
                    title="کاهش تعداد"
                  >
                    -
                  </button>
                )}
              </div>
            ) : (
              <button type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#003262] p-3 text-sm text-white transition-all hover:bg-[#00244a] hover:shadow-lg sm:mt-0 md:text-base"
                onClick={handleInitialAdd}
              >
                <span>افزودن به فاکتور</span>
                {hasMinimum && minimumAmount! > 1 && (
                  <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold">
                    {e2p(minimumAmount!.toString())} عدد
                  </span>
                )}
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
