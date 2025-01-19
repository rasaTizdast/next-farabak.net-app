"use client";

import Link from "next/link";
import {
  FiHome,
  FiSettings,
  FiLogOut,
  FiBox,
  FiFileText,
  FiFile,
  FiBarChart2,
} from "react-icons/fi";
import { BiCategory } from "react-icons/bi";
import { IoReturnDownForward } from "react-icons/io5";
import { useUser } from "@/context/UserContext";
import { useState } from "react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { logout } = useUser();

  // Define sidebar items
  const sidebarItems = [
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
    { name: "فاکتورها", href: "/admin/invoices", icon: <FiFile size={20} /> },
    {
      name: "تنظیمات",
      href: "/admin/settings",
      icon: <FiSettings size={20} />,
    },
  ];

  return (
    <>
      {/* Blur Layer */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity z-40 ${
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        onClick={() => setIsCollapsed(true)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-[#0074e0] text-gray-200 transition-all flex flex-col z-50 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16">
          <h1
            className={`text-xl font-bold transition-all ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            مدیریت
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-4">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`text-white flex items-center px-4 py-3 hover:bg-[#2797ff] transition-colors ${
                isCollapsed ? "justify-center" : "gap-4"
              }`}
            >
              {item.icon}
              <span className={`${isCollapsed ? "hidden" : "block"}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* Back to Main Website Button */}
        <Link
          href="/"
          className={`flex items-center px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white transition-colors mt-auto ${
            isCollapsed ? "justify-center" : "gap-4"
          }`}
        >
          <IoReturnDownForward size={20} />
          <span className={`${isCollapsed ? "hidden" : "block"}`}>
            برگشت به سایت
          </span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={logout}
          className={`flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white transition-colors ${
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
