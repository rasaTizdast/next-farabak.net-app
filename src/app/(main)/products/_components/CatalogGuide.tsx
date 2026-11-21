import type { ReactNode } from "react";

interface CatalogGuideProps {
  title: string;
  children: ReactNode;
}

export default function CatalogGuide({ title, children }: CatalogGuideProps) {
  return (
    <details className="group my-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 text-start text-sm font-semibold text-(--farabak-ink-deep) transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) motion-reduce:transition-none sm:px-5">
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-(--farabak-surface-blue) text-(--farabak-action-blue)"
        >
          i
        </span>
        <span className="min-w-0 flex-1 wrap-break-word whitespace-normal">
          راهنمای انتخاب {title}
        </span>
        <span className="shrink-0 text-xs font-medium text-(--farabak-action-blue) group-open:hidden">
          بازکردن
        </span>
        <span className="hidden shrink-0 text-xs font-medium text-(--farabak-action-blue) group-open:inline">
          بستن
        </span>
        <span aria-hidden="true" className="text-lg leading-none text-slate-500">
          ⌄
        </span>
      </summary>
      <div className="border-t border-slate-200 bg-slate-50 p-2 sm:p-4">{children}</div>
    </details>
  );
}
