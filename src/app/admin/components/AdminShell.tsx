"use client";

import Sidebar from "./Sidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell relative min-h-screen bg-linear-to-l from-slate-950 via-[#0c1e39] to-slate-900 text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        id="main-content"
        tabIndex={-1}
        className="max-w-full overflow-auto p-4 pt-16 transition-all duration-200 md:mr-[64px] md:p-6 md:pt-0"
      >
        {children}
      </main>
    </div>
  );
}
