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
    <div className="relative min-h-screen bg-gradient-to-l from-blue-800 to-blue-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="p-6 mr-[64px] max-w-full overflow-auto transition-all">
        {children}
      </main>
    </div>
  );
}
