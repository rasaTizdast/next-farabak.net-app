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
  const { logout } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWidth(currentWidth);
      setTextVis(currentWidth >= 576);
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

  return (
    <div className="dashboard-shell relative flex min-w-0 gap-8 max-[576px]:gap-3">
      {overlay && (
        <button
          type="button"
          aria-label="بستن منوی داشبورد"
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => {
            setTextVis(false);
            setOverlay(false);
          }}
        />
      )}
      <aside
        aria-label="منوی داشبورد"
        className={`z-50 flex shrink-0 flex-col bg-[#003262] text-white max-[576px]:min-w-16 max-[576px]:transition-[width] max-[576px]:duration-200 ${width && width <= 576 ? (textVis ? "w-52" : "w-16") : "w-[25%] max-w-[200px] min-w-[150px]"}`}
      >
        <ul className="sticky top-[61px] flex max-h-max w-full flex-1 list-none flex-col text-base">
          {asideData.map(({ id, link, name, icon }) => (
            <li key={id}>
              <Link
                href={link}
                aria-label={name}
                aria-current={pathname === link ? "page" : undefined}
                className={`flex min-h-12 w-full items-center gap-3 p-4 font-medium text-white! transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${pathname === link ? "bg-[#318ce7]" : "hover:bg-blue-800"}`}
                onClick={() => {
                  if (width && width <= 576) {
                    setTextVis(false);
                    setOverlay(false);
                  }
                }}
              >
                <span aria-hidden="true" className="shrink-0 text-lg">
                  {icon}
                </span>
                {textVis && <span className="min-w-0 flex-1 text-sm">{name}</span>}
              </Link>
            </li>
          ))}
          {width && width <= 576 && (
            <button
              type="button"
              className="z-10 mt-4 flex min-h-11 cursor-pointer items-center justify-center border-t border-blue-300/40 bg-[#003262] p-3 text-white focus-visible:outline-2 focus-visible:outline-white"
              onClick={() => {
                setTextVis((v) => !v);
                setOverlay((v) => !v);
              }}
              aria-label={textVis ? "بستن منو" : "باز کردن منو"}
            >
              {textVis ? <FaArrowRight /> : <FaArrowLeft />}
            </button>
          )}
          <li>
            <button
              type="button"
              onClick={() => logout()}
              aria-label="خروج از حساب"
              className="flex min-h-12 w-full cursor-pointer items-center gap-3 p-4 text-center font-medium text-red-200 transition-colors duration-200 last:mt-auto hover:bg-red-700 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              <ImExit aria-hidden="true" className="shrink-0 text-lg" />
              {textVis && "خروج از حساب"}
            </button>
          </li>
        </ul>
      </aside>
      <div className="mb-10 flex min-w-0 flex-1 flex-col py-4 ps-4 pe-0">{children}</div>
    </div>
  );
};

export default DashboardLayoutContent;
