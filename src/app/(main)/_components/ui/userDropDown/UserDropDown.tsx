import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { PiUserCircleDashedFill } from "react-icons/pi";

import { useInvoice } from "@/context/InvoiceContext";
import { useUser } from "@/context/UserContext";

import styles from "./UserDropDown.module.css";

const UserDropDown = () => {
  const router = useRouter();
  const [isVis, setIsVis] = useState(false);
  const [expandedInvoice, setExpandedInvoice] = useState(true);
  const { isAdmin, isBranch, logout } = useUser();
  const { invoice, removeProductFromInvoice, updateProductQuantity } = useInvoice();

  const dropdownRef = useRef<HTMLUListElement | null>(null); // Ref to track the dropdown element
  const iconRef = useRef<HTMLDivElement | null>(null); // Ref to track the icon element
  const invoiceMenuItemRef = useRef<HTMLLIElement | null>(null); // Ref to track invoice option in menu

  // Calculate total monetary amount
  const calculateTotalAmount = () => {
    return invoice.products.reduce((total, product) => {
      const itemPrice = product.Price || 0;
      const itemDiscount = product.Discount || 0;
      const finalPrice = (itemPrice - itemDiscount) * product.Quantity;
      return total + finalPrice;
    }, 0);
  };

  // Calculate total quantity of all products
  const calculateTotalQuantity = () => {
    return invoice.products.reduce((total, product) => {
      return total + product.Quantity;
    }, 0);
  };

  const totalAmount = calculateTotalAmount();
  const totalQuantity = calculateTotalQuantity();
  const formattedAmount = new Intl.NumberFormat("fa-IR").format(totalAmount);

  // Function to handle clicks outside the component
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) && // Click is outside the dropdown menu
      iconRef.current &&
      !iconRef.current.contains(event.target as Node) // Click is outside the icon
    ) {
      setIsVis(false); // Close the submenu
    }
  };

  // Handle quantity change for a product
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProductFromInvoice(productId);
    } else {
      updateProductQuantity(productId, newQuantity);
    }
  };

  // Toggle expanded invoice view
  const toggleExpandedInvoice = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent closing the dropdown
    setExpandedInvoice((prev) => !prev);
  };

  useEffect(() => {
    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up the event listener when the component unmounts
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={iconRef} className={styles.userIcon}>
      <div className={styles.iconContainer}>
        <PiUserCircleDashedFill
          onClick={() => setIsVis((v) => !v)} // Toggle the submenu when clicking the icon
        />
        {invoice.products.length > 0 && (
          <div className={styles.invoiceBadge}>
            {new Intl.NumberFormat("fa-IR").format(totalQuantity)}
          </div>
        )}
      </div>

      {isVis && (
        <ul
          className={styles.subMenu}
          ref={dropdownRef}
          onClick={(e) => {
            // Don't close if clicking in the expanded invoice area
            if (
              expandedInvoice &&
              e.target instanceof Node &&
              dropdownRef.current?.querySelector(`.${styles.expandedInvoice}`)?.contains(e.target)
            ) {
              e.stopPropagation();
            } else if (!e.defaultPrevented) {
              setIsVis((v) => !v);
            }
          }}
        >
          {isAdmin && (
            <li>
              <Link href="/admin">پنل مدیریت</Link>
            </li>
          )}
          {isBranch && (
            <li>
              <Link href="/admin/branches/my">پنل شعبه</Link>
            </li>
          )}
          {!isAdmin && !isBranch && (
            <li>
              <Link href="/dashboard">پروفایل</Link>
            </li>
          )}
          {!isAdmin && !isBranch && (
            <>
              <li
                className={`${styles.invoiceOption} ${expandedInvoice ? styles.expanded : ""}`}
                ref={invoiceMenuItemRef}
                onClick={(e) => {
                  if (expandedInvoice) {
                    e.stopPropagation();
                  }
                }}
              >
                <div className={styles.invoiceOptionHeader} onClick={toggleExpandedInvoice}>
                  <div className={styles.invoiceTitle}>
                    فاکتور فعلی
                    {invoice.products.length > 0 && (
                      <span className={styles.invoiceAmount}>{formattedAmount} تومان</span>
                    )}
                  </div>
                </div>

                {expandedInvoice && (
                  <div className={styles.expandedInvoice} onClick={(e) => e.stopPropagation()}>
                    <h4>فاکتور فعلی</h4>
                    {invoice.products.length > 0 ? (
                      <>
                        <div className={styles.expandedInvoiceContent}>
                          {invoice.products.map((product) => {
                            const itemPrice = product.Price || 0;
                            const itemDiscount = product.Discount || 0;
                            const finalUnitPrice = itemPrice - itemDiscount;

                            const min = product.minAmount ?? 0;
                            const max = product.maxAmount ?? Infinity;
                            const current = product.Quantity;

                            const canIncrease = max === Infinity || current < max;

                            return (
                              <div key={product.ProductId} className={styles.expandedInvoiceItem}>
                                <div className={styles.productDetails}>
                                  <div className={styles.productName}>{product.ProductName}</div>
                                  <div className={styles.priceContainer}>
                                    {itemDiscount > 0 ? (
                                      <>
                                        <span className={styles.originalPrice}>
                                          {new Intl.NumberFormat("fa-IR").format(itemPrice)} تومان
                                        </span>
                                        <span className={styles.finalPrice}>
                                          {new Intl.NumberFormat("fa-IR").format(finalUnitPrice)}{" "}
                                          تومان
                                        </span>
                                      </>
                                    ) : (
                                      <span className={styles.finalPrice}>
                                        {new Intl.NumberFormat("fa-IR").format(itemPrice)} تومان
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className={styles.quantityControls}>
                                  <button
                                    type="button"
                                    className={styles.removeBtn}
                                    onClick={() => removeProductFromInvoice(product.ProductId)}
                                  >
                                    حذف
                                  </button>

                                  <div className={styles.quantityButtons}>
                                    <button
                                      type="button"
                                      className={`${styles.quantityBtn} ${!canIncrease ? styles.disabled : ""}`}
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

                                    <span className={`${styles.quantity} px-2`}>
                                      {new Intl.NumberFormat("fa-IR").format(current)}
                                      {min > 1 && current === min && " (حداقل)"}
                                      {max < Infinity && current === max && " (حداکثر)"}
                                    </span>

                                    <button
                                      type="button"
                                      className={`${styles.quantityBtn} ${current <= min ? styles.disabled : ""}`}
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
                        <div className={styles.expandedInvoiceFooter}>
                          <div className={styles.totalSection}>
                            <span className={styles.totalLabel}>مجموع:</span>
                            <span className={styles.totalAmount}>{formattedAmount} تومان</span>
                          </div>
                          <button
                            type="button"
                            className={styles.checkoutBtn}
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
                      <div className={styles.expandedInvoiceEmpty}>فاکتور شما خالی است</div>
                    )}
                  </div>
                )}
              </li>
            </>
          )}
          <li>
            <Link href="/dashboard/all-invoices">فاکتور‌ها</Link>
          </li>
          {!isAdmin && !isBranch && (
            <li>
              <Link href="/dashboard/edit-user">ویرایش اطلاعات</Link>
            </li>
          )}
          <li className={styles.logoutOption} onClick={() => logout()}>
            خروج از حساب
          </li>
        </ul>
      )}
    </div>
  );
};

export default UserDropDown;
