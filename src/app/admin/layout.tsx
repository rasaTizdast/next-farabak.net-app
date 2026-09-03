import { Metadata } from "next";

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
      <AdminShell>{children}</AdminShell>
    </AdminThemeProvider>
  );
}
