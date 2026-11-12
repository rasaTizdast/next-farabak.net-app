import type { ReactNode } from "react";

import { PublicShell } from "@/components/public/PublicShell";
import { cn } from "@/lib/utils";

export function LoadingBlock({ className }: { className: string }) {
  return <div className={cn("rounded-md bg-slate-200", className)} />;
}

export function LoadingBreadcrumb() {
  return <LoadingBlock className="mb-5 h-13 w-full rounded-lg bg-slate-200/80" />;
}

export function SupportLoadingShell({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <PublicShell
      className={cn("pt-6 pb-12 motion-safe:animate-pulse sm:pt-8 sm:pb-14", className)}
      role="status"
      aria-label={label}
    >
      <div aria-hidden="true">
        <LoadingBreadcrumb />
        {children}
      </div>
    </PublicShell>
  );
}

export function SupportIntroSkeleton({ actions = true }: { actions?: boolean }) {
  return (
    <div className="flex flex-col gap-5 py-6 md:gap-6 md:py-8">
      <LoadingBlock className="h-5 w-32" />
      <div className="space-y-4 md:max-w-3xl">
        <LoadingBlock className="h-9 w-3/4 max-w-xl md:h-12" />
        <div className="space-y-2 py-1">
          <LoadingBlock className="h-4 w-full" />
          <LoadingBlock className="h-4 w-4/5 sm:hidden" />
        </div>
      </div>
      {actions ? <LoadingBlock className="h-11 w-40 rounded-xl" /> : null}
    </div>
  );
}
