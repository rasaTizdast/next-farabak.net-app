"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useUser();

  const isBranch = user?.role?.toLowerCase() === "branch";
  const sidebarItems = isBranch ? branchSidebarItems : adminSidebarItems;

  const isExpanded = isOpen || isDesktopHovered;

  const pathname = usePathname();
  const currentHref = sidebarItems
    .filter((item) => pathname === item.href || pathname.startsWith(item.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
    setIsDesktopHovered(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const main = document.getElementById("main-content");
    const wasInert = main?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    if (main) main.inert = true;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSidebar();
        triggerRef.current?.focus();
      } else if (event.key === "Tab") {
        const controls = [
          triggerRef.current,
          ...Array.from(
            sidebarRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ??
              []
          ),
        ].filter((element): element is HTMLElement => element !== null);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      if (main) main.inert = wasInert;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeSidebar]);

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
        id="admin-sidebar-toggle"
        ref={triggerRef}
        type="button"
        className="fixed top-4 right-4 z-60 flex size-10 items-center justify-center rounded-lg bg-[#0074e0] text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isExpanded ? "بستن منو" : "باز کردن منو"}
        aria-expanded={isExpanded}
        aria-controls="admin-sidebar"
      >
        {isExpanded ? (
          <FiX size={20} aria-hidden="true" />
        ) : (
          <FiMenu size={20} aria-hidden="true" />
        )}
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        id="admin-sidebar"
        aria-label="ناوبری پنل مدیریت"
        className={`fixed top-0 right-0 z-50 h-dvh flex-col bg-[#0074e0] text-gray-200 transition-[width] duration-200 motion-reduce:transition-none md:flex ${isOpen ? "flex" : "hidden"} ${
          isExpanded ? "w-64" : "w-16"
        }`}
        onMouseEnter={() => {
          if (window.innerWidth >= 768) setIsDesktopHovered(true);
        }}
        onMouseLeave={() => {
          if (!sidebarRef.current?.contains(document.activeElement)) setIsDesktopHovered(false);
        }}
        onFocusCapture={() => {
          if (window.innerWidth >= 768) setIsDesktopHovered(true);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setIsDesktopHovered(false);
        }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center">
          <span
            className={`text-xl font-bold transition-opacity ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            {isBranch ? "پنل شعبه" : "مدیریت"}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 flex-1 overflow-y-auto" aria-label="منوی اصلی">
          {sidebarItems.map((item) => {
            const isCurrent = currentHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-white transition-colors hover:bg-[#2797ff] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${
                  isExpanded ? "gap-4" : "justify-center"
                }`}
                onClick={closeSidebar}
                aria-current={isCurrent ? "page" : undefined}
              >
                <span aria-hidden="true" className="flex shrink-0 items-center justify-center">
                  {item.icon}
                </span>
                <span className={`${isExpanded ? "block" : "sr-only"}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to Main Website Button */}
        <Link
          href="/"
          className={`flex items-center bg-blue-800 px-4 py-2 text-white transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${
            isExpanded ? "gap-4" : "justify-center"
          }`}
          onClick={closeSidebar}
        >
          <IoReturnDownForward size={20} aria-hidden="true" />
          <span className={`${isExpanded ? "block" : "sr-only"}`}>برگشت به سایت</span>
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          className={`flex items-center bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${
            isExpanded ? "gap-4" : "justify-center"
          }`}
        >
          <FiLogOut size={20} aria-hidden="true" />
          <span className={`${isExpanded ? "block" : "sr-only"}`}>خروج</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
