"use client";

import { useState } from "react";
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

import { useUser } from "@/context/UserContext";

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
      href: "/admin/reports",
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
    <div
      className={`flex flex-col h-screen bg-[#0074e0] text-gray-200 transition-all sticky top-0 right-0 ${
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

      {/* Logout Button */}
      <button
        onClick={logout}
        className={`flex items-center px-4 py-2 mt-auto bg-red-600 hover:bg-red-700 text-white transition-colors ${
          isCollapsed ? "justify-center" : "gap-4"
        }`}
      >
        <FiLogOut size={20} />
        <span className={`${isCollapsed ? "hidden" : "block"}`}>خروج</span>
      </button>
    </div>
  );
};

export default Sidebar;
