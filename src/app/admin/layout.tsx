import { Metadata } from "next";
import Link from "next/link";

import AdminShell from "./components/AdminShell";
import AdminThemeProvider from "./components/AdminThemeProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "پنل مدیریت | فرابک",
  description: "پنل مدیریت وب‌سایت | فرابک",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminShell>
        <Link
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-100 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900 focus:shadow-lg"
        >
          رفتن به محتوای اصلی
        </Link>
        {children}
      </AdminShell>
    </AdminThemeProvider>
  );
}
