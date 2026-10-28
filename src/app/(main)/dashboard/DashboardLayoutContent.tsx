"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaFileInvoice, FaUserEdit } from "react-icons/fa";
import { ImExit } from "react-icons/im";
import { MdDashboard, MdOutlinePassword } from "react-icons/md";
import { TbInvoice } from "react-icons/tb";

import { useUser } from "@/context/UserContext";

const asideData = [
  { id: 1, link: "/dashboard", name: "داشبورد", icon: <MdDashboard /> },
  {
    id: 2,
    link: "/dashboard/edit-user",
    name: "ویرایش اطلاعات",
    icon: <FaUserEdit />,
  },
  {
    id: 3,
    link: "/dashboard/change-password",
    name: "تغییر کلمه عبور",
    icon: <MdOutlinePassword />,
  },
  {
    id: 4,
    link: "/dashboard/new-invoice",
    name: "ذخیره فاکتور جدید",
    icon: <TbInvoice />,
  },
  {
    id: 5,
    link: "/dashboard/all-invoices",
    name: "فاکتور‌ها",
    icon: <FaFileInvoice />,
  },
];

const DashboardLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [overlay, setOverlay] = useState(false);
  const [textVis, setTextVis] = useState(false);
  const { logout, user, userFullName } = useUser();
  const pathname = usePathname();
  const isMobile = width !== undefined && width <= 576;
  const showLabels = !isMobile || textVis;
  const displayName = userFullName?.trim() || "حساب کاربری";

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWidth(currentWidth);
      setTextVis(currentWidth > 576);
      setOverlay(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!overlay) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTextVis(false);
        setOverlay(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [overlay]);

  const closeMobileMenu = () => {
    if (isMobile) {
      setTextVis(false);
      setOverlay(false);
    }
  };

  return (
    <div className="dashboard-shell relative flex min-w-0 flex-1 gap-4 bg-(--farabak-paper) px-3 py-4 sm:gap-6 sm:px-4">
      {overlay && (
        <button
          type="button"
          aria-label="بستن منوی داشبورد"
          className="fixed inset-0 z-40 bg-(--farabak-ink-deep)/50 sm:hidden"
          onClick={closeMobileMenu}
        />
      )}
      <aside
        aria-label="منوی داشبورد"
        className={`z-50 flex shrink-0 flex-col self-start rounded-2xl bg-(--farabak-ink-deep) text-white shadow-lg max-[576px]:transition-[width] max-[576px]:duration-200 max-[576px]:motion-reduce:transition-none ${isMobile ? (textVis ? "w-60" : "w-16") : "w-60"}`}
      >
        <div className="flex items-center gap-3 border-b border-white/15 p-4">
          <div
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--farabak-signal-cyan) font-extrabold text-(--farabak-ink-deep)"
          >
            {displayName.slice(0, 1)}
          </div>
          {showLabels && (
            <div className="min-w-0">
              <p className="text-xs text-white/65">میز کار شخصی</p>
              <p className="truncate text-sm font-bold">{displayName}</p>
              {user?.email && (
                <p className="truncate text-xs text-white/65" dir="ltr">
                  {user.email}
                </p>
              )}
            </div>
          )}
        </div>

        {isMobile && (
          <button
            type="button"
            className="flex min-h-11 items-center justify-center border-b border-white/15 p-3 text-white focus-visible:outline-2 focus-visible:outline-white"
            onClick={() => {
              setTextVis((visible) => !visible);
              setOverlay((visible) => !visible);
            }}
            aria-controls="dashboard-navigation"
            aria-expanded={textVis}
            aria-label={textVis ? "بستن منو" : "باز کردن منو"}
          >
            {textVis ? <FaArrowRight aria-hidden="true" /> : <FaArrowLeft aria-hidden="true" />}
          </button>
        )}

        <nav id="dashboard-navigation" aria-label="ناوبری حساب کاربری" className="p-2">
          <ul className="flex flex-col gap-1 text-sm">
            {asideData.map(({ id, link, name, icon }) => {
              const isActive =
                pathname === link || (link !== "/dashboard" && pathname.startsWith(`${link}/`));

              return (
                <li key={id}>
                  <Link
                    href={link}
                    aria-label={name}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-12 w-full items-center gap-3 rounded-xl p-3 font-medium text-white! transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${isActive ? "bg-(--farabak-action-blue)" : "hover:bg-white/10"}`}
                    onClick={closeMobileMenu}
                  >
                    <span aria-hidden="true" className="shrink-0 text-lg">
                      {icon}
                    </span>
                    {showLabels && <span className="min-w-0 flex-1">{name}</span>}
                  </Link>
                </li>
              );
            })}
            <li className="mt-3 border-t border-white/15 pt-3">
              <button
                type="button"
                onClick={() => logout()}
                aria-label="خروج از حساب"
                className="flex min-h-12 w-full items-center gap-3 rounded-xl p-3 text-center font-medium text-red-200 transition-colors duration-200 hover:bg-red-700 hover:text-white focus-visible:outline-2 focus-visible:outline-white motion-reduce:transition-none"
              >
                <ImExit aria-hidden="true" className="shrink-0 text-lg" />
                {showLabels && "خروج از حساب"}
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="mb-10 flex min-w-0 flex-1 flex-col py-1 ps-0 sm:py-2 sm:ps-2">{children}</div>
    </div>
  );
};

export default DashboardLayoutContent;
