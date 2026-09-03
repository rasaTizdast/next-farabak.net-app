"use client";

import Sidebar from "./Sidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-linear-to-l from-blue-800 to-blue-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="max-w-full overflow-auto p-4 pt-16 transition-all duration-200 md:mr-[64px] md:p-6 md:pt-0">
        {children}
      </main>
    </div>
  );
}
