import Sidebar from "./components/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "پنل مدیریت | فرابک",
  description: "پنل مدیریت وب‌سایت | فرابک",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6  bg-gradient-to-l from-blue-800 to-blue-900">
        {children}
      </main>
    </div>
  );
}
