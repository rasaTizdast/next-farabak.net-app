"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { BiCategory } from "react-icons/bi";
import {
  FiHome,
  FiSettings,
  FiLogOut,
  FiBox,
  FiFileText,
  FiFile,
  FiBarChart2,
  FiTag,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { IoReturnDownForward } from "react-icons/io5";
import { MdOutlineStorefront } from "react-icons/md";

import { useUser } from "@/context/UserContext";

const adminSidebarItems = [
  { name: "داشبورد", href: "/admin", icon: <FiHome size={20} /> },
  { name: "محصولات", href: "/admin/products", icon: <FiBox size={20} /> },
  { name: "قیمت‌های همکار", href: "/admin/partner-prices", icon: <FiTag size={20} /> },
  {
    name: "دسته‌بندی‌ها",
    href: "/admin/products/categories",
    icon: <BiCategory />,
  },
  { name: "صفحات", href: "/admin/pages", icon: <FiFileText size={20} /> },
  {
    name: "گزارش‌ها",
    href: "/admin/analytics",
    icon: <FiBarChart2 size={20} />,
  },
  {
    name: "شعبه‌ها",
    href: "/admin/branches",
    icon: <MdOutlineStorefront size={20} />,
  },
  {
    name: "انبارها",
    href: "/admin/warehouses",
    icon: <MdOutlineStorefront size={20} />,
  },
  { name: "فاکتورها", href: "/admin/invoices", icon: <FiFile size={20} /> },
  {
    name: "تنظیمات",
    href: "/admin/settings",
    icon: <FiSettings size={20} />,
  },
];

const branchSidebarItems = [
  { name: "شعبه من", href: "/admin/branches/my", icon: <MdOutlineStorefront size={20} /> },
  {
    name: "قیمت‌های همکار",
    href: "/admin/branches/my/partner-prices",
    icon: <FiTag size={20} />,
  },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopHovered, setIsDesktopHovered] = useState(false);
  const { logout, user } = useUser();

  const isBranch = user?.role === "Branch";
  const sidebarItems = isBranch ? branchSidebarItems : adminSidebarItems;

  const isExpanded = isOpen || isDesktopHovered;

  const pathname = usePathname();

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
    setIsDesktopHovered(false);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        className="fixed top-4 right-4 z-50 flex size-10 items-center justify-center rounded-lg bg-[#0074e0] text-white shadow-lg md:hidden"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isExpanded ? "بستن منو" : "باز کردن منو"}
      >
        {isExpanded ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity ${
          isExpanded ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full flex-col bg-[#0074e0] text-gray-200 transition-[width] duration-200 ${
          isExpanded ? "w-64" : "w-16"
        }`}
        onMouseEnter={() => setIsDesktopHovered(true)}
        onMouseLeave={() => setIsDesktopHovered(false)}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center">
          <h1
            className={`text-xl font-bold transition-opacity ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            {isBranch ? "پنل شعبه" : "مدیریت"}
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 flex-1 overflow-y-auto" aria-label="منوی اصلی">
          {sidebarItems.map((item) => {
            const isCurrent = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-white transition-colors hover:bg-[#2797ff] ${
                  isExpanded ? "gap-4" : "justify-center"
                }`}
                onClick={closeSidebar}
                aria-current={isCurrent ? "page" : undefined}
              >
                {item.icon}
                <span className={`${isExpanded ? "block" : "hidden"}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to Main Website Button */}
        <Link
          href="/"
          className={`flex items-center bg-blue-800 px-4 py-2 text-white transition-colors hover:bg-blue-900 ${
            isExpanded ? "gap-4" : "justify-center"
          }`}
          onClick={closeSidebar}
        >
          <IoReturnDownForward size={20} />
          <span className={`${isExpanded ? "block" : "hidden"}`}>برگشت به سایت</span>
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          className={`flex items-center bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 ${
            isExpanded ? "gap-4" : "justify-center"
          }`}
        >
          <FiLogOut size={20} />
          <span className={`${isExpanded ? "block" : "hidden"}`}>خروج</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
