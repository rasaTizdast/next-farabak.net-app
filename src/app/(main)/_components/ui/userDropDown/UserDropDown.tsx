import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { PiUserCircleDashedFill } from "react-icons/pi";

import { useInvoice } from "@/context/InvoiceContext";
import { useUser } from "@/context/UserContext";

const faNumberFormatter = new Intl.NumberFormat("fa-IR");

const UserDropDown = () => {
  const router = useRouter();
  const [isVis, setIsVis] = useState(false);
  const [expandedInvoice, setExpandedInvoice] = useState(true);
  const { isAdmin, isBranch, logout } = useUser();
  const { invoice, removeProductFromInvoice, updateProductQuantity } = useInvoice();

  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const iconRef = useRef<HTMLDivElement | null>(null);
  const invoiceMenuItemRef = useRef<HTMLLIElement | null>(null);

  const calculateTotalAmount = () => {
    return invoice.products.reduce((total, product) => {
      const itemPrice = product.Price || 0;
      const itemDiscount = product.Discount || 0;
      const finalPrice = (itemPrice - itemDiscount) * product.Quantity;
      return total + finalPrice;
    }, 0);
  };

  const calculateTotalQuantity = () => {
    return invoice.products.reduce((total, product) => {
      return total + product.Quantity;
    }, 0);
  };

  const totalAmount = calculateTotalAmount();
  const totalQuantity = calculateTotalQuantity();
  const formattedAmount = faNumberFormatter.format(totalAmount);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      iconRef.current &&
      !iconRef.current.contains(event.target as Node)
    ) {
      setIsVis(false);
    }
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProductFromInvoice(productId);
    } else {
      updateProductQuantity(productId, newQuantity);
    }
  };

  const toggleExpandedInvoice = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedInvoice((prev) => !prev);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={iconRef} className="relative flex items-center">
      <div className="relative flex items-center">
        <PiUserCircleDashedFill
          onClick={() => setIsVis((v) => !v)}
          className="cursor-pointer text-[2.3rem] text-[#ddd] md:text-[1.9rem] 2xl:text-[2.7rem]"
        />
        {invoice.products.length > 0 && (
          <div className="absolute inset-e-[-5px] top-[-5px] flex size-[18px] cursor-pointer items-center justify-center rounded-full bg-[#0e6aff] text-[0.7rem] text-white md:size-[16px] md:text-[0.65rem]">
            {faNumberFormatter.format(totalQuantity)}
          </div>
        )}
      </div>

      {isVis && (
        <ul
          className="absolute inset-e-[-151%] top-[150%] z-100 max-w-[300px] min-w-[280px] cursor-pointer overflow-visible rounded-lg bg-[#f8f8f8] p-0 shadow-[0_4px_12px_1px_rgba(0,0,0,0.3)] md:max-w-[220px] md:min-w-[220px]"
          ref={dropdownRef}
          role="none"
          onClick={(e) => {
            if (
              expandedInvoice &&
              e.target instanceof Node &&
              dropdownRef.current?.querySelector(".expanded-invoice")?.contains(e.target)
            ) {
              e.stopPropagation();
            } else if (!e.defaultPrevented) {
              setIsVis((v) => !v);
            }
          }}
        >
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                className="block border-b border-[#ddd] px-4 py-3 transition-[background-color,padding-inline-end] duration-200 hover:bg-[#aceaff] hover:pr-6"
              >
                پنل مدیریت
              </Link>
            </li>
          )}
          {isBranch && (
            <li>
              <Link
                href="/admin/branches/my"
                className="block border-b border-[#ddd] px-4 py-3 transition-[background-color,padding-inline-end] duration-200 hover:bg-[#aceaff] hover:pr-6"
              >
                پنل شعبه
              </Link>
            </li>
          )}
          {!isAdmin && !isBranch && (
            <li>
              <Link
                href="/dashboard"
                className="block border-b border-[#ddd] px-4 py-3 transition-[background-color,padding-inline-end] duration-200 hover:bg-[#aceaff] hover:pr-6"
              >
                پروفایل
              </Link>
            </li>
          )}
          {!isAdmin && !isBranch && (
            <>
              <li
                className={`relative border-b border-[#ddd] p-0 ${expandedInvoice ? "bg-[#f0f0f0]" : ""}`}
                ref={invoiceMenuItemRef}
                role="none"
                onClick={(e) => {
                  if (expandedInvoice) {
                    e.stopPropagation();
                  }
                }}
              >
                <button
                  type="button"
                  className="w-full cursor-pointer px-4 py-3"
                  onClick={toggleExpandedInvoice}
                  aria-label="تغییر وضعیت فاکتور"
                >
                  <div className="flex flex-col gap-[0.3rem]">
                    فاکتور فعلی
                    {invoice.products.length > 0 && (
                      <span className="text-[0.8rem] font-medium text-[#1a73e8]">
                        {formattedAmount} تومان
                      </span>
                    )}
                  </div>
                </button>

                {expandedInvoice && (
                  <div
                    className="expanded-invoice w-full overflow-hidden bg-white shadow-[0_1px_4px_rgba(0,0,0,0.1)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="m-0 bg-[#003566] p-[0.8rem] text-center text-[0.95rem] font-semibold text-white">
                      فاکتور فعلی
                    </h4>
                    {invoice.products.length > 0 ? (
                      <>
                        <div className="max-h-[300px] overflow-y-auto">
                          {invoice.products.map((product) => {
                            const itemPrice = product.Price || 0;
                            const itemDiscount = product.Discount || 0;
                            const finalUnitPrice = itemPrice - itemDiscount;

                            const min = product.minAmount ?? 0;
                            const max = product.maxAmount ?? Infinity;
                            const current = product.Quantity;

                            const canIncrease = max === Infinity || current < max;

                            return (
                              <div
                                key={product.ProductId}
                                className="flex flex-col gap-[0.8rem] border-b border-[#eee] p-[0.8rem]"
                              >
                                <div className="flex flex-col gap-[0.3rem]">
                                  <div className="text-[0.95rem] font-medium">
                                    {product.ProductName}
                                  </div>
                                  <div className="flex flex-col gap-[0.2rem]">
                                    {itemDiscount > 0 ? (
                                      <>
                                        <span className="text-[0.8rem] text-[#777] line-through">
                                          {faNumberFormatter.format(itemPrice)} تومان
                                        </span>
                                        <span className="text-[0.9rem] font-semibold text-[#0077b6]">
                                          {faNumberFormatter.format(finalUnitPrice)} تومان
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-[0.9rem] font-semibold text-[#0077b6]">
                                        {faNumberFormatter.format(itemPrice)} تومان
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    className="cursor-pointer rounded-[4px] border-none bg-[#f44336] px-[0.7rem] py-[0.4rem] text-[0.9rem] text-white hover:bg-[#d32f2f]"
                                    onClick={() => removeProductFromInvoice(product.ProductId)}
                                  >
                                    حذف
                                  </button>

                                  <div className="ltr flex items-center rounded-[6px] bg-[#ececec] p-[0.2rem]">
                                    <button
                                      type="button"
                                      className={`flex size-[28px] cursor-pointer items-center justify-center rounded-[4px] border-none bg-[#f8f8f8] text-base font-bold transition-colors duration-200 hover:bg-white ${!canIncrease ? "cursor-not-allowed opacity-50" : ""}`}
                                      onClick={() =>
                                        canIncrease &&
                                        handleQuantityChange(product.ProductId, current + 1)
                                      }
                                      disabled={!canIncrease}
                                      title={!canIncrease ? `حداکثر ${max} عدد` : ""}
                                      aria-label="افزایش تعداد"
                                    >
                                      +
                                    </button>

                                    <span className="inline-block min-w-[30px] px-2 text-center text-[0.9rem]">
                                      {faNumberFormatter.format(current)}
                                      {min > 1 && current === min && " (حداقل)"}
                                      {max < Infinity && current === max && " (حداکثر)"}
                                    </span>

                                    <button
                                      type="button"
                                      className={`flex size-[28px] cursor-pointer items-center justify-center rounded-[4px] border-none bg-[#f8f8f8] text-base font-bold transition-colors duration-200 hover:bg-white ${current <= min ? "cursor-not-allowed opacity-50" : ""}`}
                                      onClick={() =>
                                        current > min &&
                                        handleQuantityChange(product.ProductId, current - 1)
                                      }
                                      disabled={current <= min}
                                      title={current <= min ? `حداقل ${min} عدد` : ""}
                                      aria-label="کاهش تعداد"
                                    >
                                      -
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex flex-col gap-[0.8rem] border-t border-[#eee] bg-[#f8f8f8] p-[0.8rem]">
                          <div className="flex items-center justify-between">
                            <span className="text-[0.95rem] font-semibold text-[#333]">مجموع:</span>
                            <span className="text-[1.1rem] font-bold text-[#0077b6]">
                              {formattedAmount} تومان
                            </span>
                          </div>
                          <button
                            type="button"
                            className="w-full cursor-pointer rounded-[6px] border-none bg-[#318ce7] p-[0.7rem] text-base font-medium text-white transition-colors duration-200 hover:bg-[#0e6aff]"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsVis(false);
                              router.push("/dashboard/new-invoice");
                            }}
                          >
                            ثبت فاکتور
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-[#888]">فاکتور شما خالی است</div>
                    )}
                  </div>
                )}
              </li>
            </>
          )}
          <li>
            <Link
              href="/dashboard/all-invoices"
              className="block border-b border-[#ddd] px-4 py-3 transition-[background-color,padding-inline-end] duration-200 hover:bg-[#aceaff] hover:pr-6"
            >
              فاکتور‌ها
            </Link>
          </li>
          {!isAdmin && !isBranch && (
            <li>
              <Link
                href="/dashboard/edit-user"
                className="block border-b border-[#ddd] px-4 py-3 transition-[background-color,padding-inline-end] duration-200 hover:bg-[#aceaff] hover:pr-6"
              >
                ویرایش اطلاعات
              </Link>
            </li>
          )}
          <li className="text-red-500">
            <button
              type="button"
              className="w-full border-b border-[#ddd] px-4 py-3 text-right transition-colors duration-200"
              onClick={() => logout()}
            >
              خروج از حساب
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default UserDropDown;
