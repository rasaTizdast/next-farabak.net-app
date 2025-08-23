"use client";

import Link from "next/link";
import { useState } from "react";
import { BiCategory } from "react-icons/bi";
import {
  FiHome,
  FiSettings,
  FiLogOut,
  FiBox,
  FiFileText,
  FiFile,
  FiBarChart2,
} from "react-icons/fi";
import { IoReturnDownForward } from "react-icons/io5";
import { MdOutlineStorefront } from "react-icons/md";

import { useUser } from "@/context/UserContext";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { logout, user } = useUser();

  // Define sidebar items for each role
  const adminSidebarItems = [
    { name: "داشبورد", href: "/admin", icon: <FiHome size={20} /> },
    { name: "محصولات", href: "/admin/products", icon: <FiBox size={20} /> },
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
    { name: "فاکتورها", href: "/admin/invoices", icon: <FiFile size={20} /> },
    {
      name: "تنظیمات",
      href: "/admin/settings",
      icon: <FiSettings size={20} />,
    },
  ];

  const branchSidebarItems = [
    { name: "شعبه من", href: "/admin/branches/my", icon: <MdOutlineStorefront size={20} /> },
  ];

  // Select the sidebar items based on user role
  const isBranch = user?.role === "Branch";
  const sidebarItems = isBranch ? branchSidebarItems : adminSidebarItems;

  return (
    <>
      {/* Blur Layer */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-md transition-opacity ${
          isCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        onClick={() => setIsCollapsed(true)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full flex-col bg-[#0074e0] text-gray-200 transition-all ${
          isCollapsed ? "w-16" : "w-64"
        }`}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center">
          <h1
            className={`text-xl font-bold transition-all ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            {isBranch ? "پنل شعبه" : "مدیریت"}
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 flex-1">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center px-4 py-3 text-white transition-colors hover:bg-[#2797ff] ${
                isCollapsed ? "justify-center" : "gap-4"
              }`}
              onClick={() => setIsCollapsed(true)}
            >
              {item.icon}
              <span className={`${isCollapsed ? "hidden" : "block"}`}>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Back to Main Website Button */}
        <Link
          href="/"
          className={`mt-auto flex items-center bg-blue-800 px-4 py-2 text-white transition-colors hover:bg-blue-900 ${
            isCollapsed ? "justify-center" : "gap-4"
          }`}
        >
          <IoReturnDownForward size={20} />
          <span className={`${isCollapsed ? "hidden" : "block"}`}>برگشت به سایت</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={logout}
          className={`flex items-center bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 ${
            isCollapsed ? "justify-center" : "gap-4"
          }`}
        >
          <FiLogOut size={20} />
          <span className={`${isCollapsed ? "hidden" : "block"}`}>خروج</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
