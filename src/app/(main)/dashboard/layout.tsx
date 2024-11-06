"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useUser } from "@/context/UserContext";

import { ImExit } from "react-icons/im";
import {
  FaArrowLeft,
  FaArrowRight,
  FaFileInvoice,
  FaUserEdit,
} from "react-icons/fa";
import { MdDashboard, MdOutlinePassword } from "react-icons/md";
import { TbInvoice } from "react-icons/tb";

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

// Define the metadata object for the dashboard routes
// export const metadata: Metadata = {
//   title: "داشبورد | فرابک",
//   description: "پنل کاربری وبسایت فرابک",
//   openGraph: {
//     title: "داشبورد",
//     description: "پنل کاربری وبسایت فرابک",
//   },
// };

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [width, setWidth] = useState(window.innerWidth);
  const [overlay, setOverlay] = useState(false);
  const [textVis, setTextVis] = useState(window.innerWidth >= 576); // Set initial state
  const { user, logout } = useUser();

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWidth(currentWidth);

      // Set textVis based on the width
      if (currentWidth >= 576) {
        setTextVis(true);
        setOverlay(false);
      } else {
        setTextVis(false);
        setOverlay(false);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
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
                className={
                  location.pathname === link ? styles.active : styles.asideLinks
                }
                onClick={() => {
                  {
                    width <= 576 && setTextVis(false);
                    width <= 576 && setOverlay(false);
                  }
                }}
              >
                {textVis && <span className={styles.text}>{name}</span>}
                {width <= 576 && <span className={styles.icon}>{icon}</span>}
              </Link>
            </li>
          ))}

          {width <= 576 && (
            <button
              className={styles.toggleButton}
              style={
                !textVis
                  ? { justifyContent: "center" }
                  : { paddingInline: "1rem" }
              }
              onClick={() => {
                setTextVis((v) => !v);
                setOverlay((v) => !v);
              }}
            >
              {textVis && <span>کوچک کردن منو</span>}
              {!textVis ? <FaArrowLeft /> : <FaArrowRight />}
            </button>
          )}
          <li>
            {textVis && (
              <span className={styles.text} onClick={() => logout()}>
                خروج از حساب
              </span>
            )}
            {width <= 576 && (
              <span className={styles.icon} onClick={() => logout()}>
                <ImExit />
              </span>
            )}
          </li>
        </ul>
      </aside>
      <div className={styles.dashboardContent}>{children}</div>
    </div>
  );
};

export default DashboardLayout;
