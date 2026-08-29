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

  return (
    <div className="relative flex gap-8">
      {overlay && (
        <div className="fixed inset-s-0 top-[80px] z-2 h-screen w-full bg-black/50"></div>
      )}
      <aside
        className={`z-3 flex w-[25%] max-w-[200px] min-w-[150px] flex-col bg-[#003262] text-white ${textVis ? "" : ""}`}
      >
        <ul className="sticky top-[61px] flex max-h-max w-full flex-1 list-none flex-col text-base">
          {asideData.map(({ id, link, name, icon }) => (
            <li key={id}>
              <Link
                href={link}
                className={`block w-full p-4 font-medium transition-colors duration-300 ${pathname === link ? "bg-[#318ce7]" : ""}`}
                onClick={() => {
                  if (width && width <= 576) {
                    setTextVis(false);
                    setOverlay(false);
                  }
                }}
              >
                {textVis && <span className="block flex-1">{name}</span>}
                {width && width <= 576 && <span className="ms-2 mt-2 text-[1rem]">{icon}</span>}
              </Link>
            </li>
          ))}
          {width && width <= 576 && (
            <button
              type="button"
              className="z-10 mt-8 flex cursor-pointer items-center justify-center border-none bg-[#003262] p-[0.6rem] text-white"
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
              className="flex w-full cursor-pointer items-center justify-center gap-4 p-4 text-center font-medium text-red-400 transition-colors duration-300 last:mt-auto"
            >
              {textVis ? "خروج از حساب" : <ImExit />}
            </button>
          </li>
        </ul>
      </aside>
      <div className="mb-10 flex w-full flex-col py-4 ps-4 pe-0">{children}</div>
    </div>
  );
};

export default DashboardLayoutContent;
