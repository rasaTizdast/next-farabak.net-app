"use client";

import Sidebar from "./Sidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell relative min-h-screen bg-[#030712] text-slate-100">
      <Sidebar />
      <main
        id="main-content"
        tabIndex={-1}
        className="max-w-full min-w-0 overflow-x-hidden p-4 pt-20 transition-[padding] duration-200 motion-reduce:transition-none md:mr-[64px] md:p-6 md:pt-6"
      >
        <header
          aria-label="سربرگ پنل مدیریت"
          className="mb-6 flex min-h-12 items-center justify-between gap-4 border-b border-slate-800 pb-4"
        >
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-300">فرابک</p>
            <p className="mt-1 text-sm text-slate-400">پنل مدیریت و عملیات</p>
          </div>
          <span className="hidden text-xs text-slate-500 sm:inline">فضای داخلی و امن</span>
        </header>
        {children}
      </main>
    </div>
  );
}
