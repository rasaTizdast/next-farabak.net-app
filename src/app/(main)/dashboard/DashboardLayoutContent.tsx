"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaFileInvoice, FaUserEdit } from "react-icons/fa";
import { ImExit } from "react-icons/im";
import { MdDashboard, MdOutlinePassword } from "react-icons/md";
import { TbInvoice } from "react-icons/tb";

import { useUser } from "@/context/UserContext";

import styles from "./DashboardLayout.module.css";

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
  const [width, setWidth] = useState<number | undefined>(undefined); // Initialize as undefined
  const [overlay, setOverlay] = useState(false);
  const [textVis, setTextVis] = useState(false);
  const { logout } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    // Only runs on the client
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWidth(currentWidth);
      setTextVis(currentWidth >= 576);
      setOverlay(false);
    };

    // Set initial width and text visibility on mount
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.dashboard}>
      {overlay && <div className={styles.overlay}></div>}
      <aside className={textVis ? styles.extended : ""}>
        <ul>
          {asideData.map(({ id, link, name, icon }) => (
            <li key={id}>
              <Link
                href={link}
                className={pathname === link ? styles.active : styles.asideLinks}
                onClick={() => {
                  if (width && width <= 576) {
                    setTextVis(false);
                    setOverlay(false);
                  }
                }}
              >
                {textVis && <span className={styles.text}>{name}</span>}
                {width && width <= 576 && <span className={styles.icon}>{icon}</span>}
              </Link>
            </li>
          ))}
          {width && width <= 576 && (
            <button
              className={styles.toggleButton}
              onClick={() => {
                setTextVis((v) => !v);
                setOverlay((v) => !v);
              }}
            >
              {textVis ? <FaArrowRight /> : <FaArrowLeft />}
            </button>
          )}
          <li>
            <span onClick={() => logout()}>{textVis ? "خروج از حساب" : <ImExit />}</span>
          </li>
        </ul>
      </aside>
      <div className={styles.dashboardContent}>{children}</div>
    </div>
  );
};

export default DashboardLayoutContent;
