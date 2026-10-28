import { PublicShell } from "@/components/public/PublicShell";

export default function ContactUsLoading() {
  return (
    <PublicShell
      as="main"
      className="animate-pulse py-10 sm:py-14 lg:py-16"
      role="status"
      aria-label="در حال بارگذاری تماس با فرابک"
    >
      <div className="space-y-5 py-10 md:py-16">
        <div className="h-4 w-28 rounded-full bg-slate-200" />
        <div className="h-12 w-96 rounded-2xl bg-slate-200" />
        <div className="h-5 w-full max-w-2xl rounded-full bg-slate-100" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)]">
        <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="h-7 w-1/2 rounded-2xl bg-slate-200" />
          <div className="h-4 w-full rounded-full bg-slate-100" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-2xl bg-slate-100" />
          ))}
          <div className="h-36 rounded-2xl bg-slate-100" />
          <div className="h-12 rounded-md bg-slate-200" />
        </div>
        <aside className="space-y-5">
          <div className="h-72 rounded-3xl border border-slate-100 bg-white shadow-sm" />
          <div className="h-56 rounded-3xl border border-slate-100 bg-slate-100 shadow-sm" />
        </aside>
      </div>
    </PublicShell>
  );
}
