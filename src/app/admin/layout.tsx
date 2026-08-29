import { Metadata } from "next";

import AdminThemeProvider from "./components/AdminThemeProvider";
import Sidebar from "./components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "پنل مدیریت | فرابک",
  description: "پنل مدیریت وب‌سایت | فرابک",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <div className="relative min-h-screen bg-linear-to-l from-blue-800 to-blue-900">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="mr-[64px] max-w-full overflow-auto p-6 transition-colors">{children}</main>
      </div>
    </AdminThemeProvider>
  );
}
