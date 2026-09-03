import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function BreadcrumbSkeleton({ className }: { className?: string }) {
  return (
    <nav
      aria-hidden="true"
      className={cn(
        "mb-5 w-full animate-pulse overflow-hidden rounded-lg bg-gray-200 p-4 shadow-lg",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-3 w-16 rounded-full bg-gray-300" />
        <div className="size-3 rounded-full bg-gray-300" />
        <div className="h-3 w-24 rounded-full bg-gray-300" />
      </div>
    </nav>
  );
}

export function TitleSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mb-6 h-8 min-w-40 animate-pulse rounded-md bg-gray-200", className)} />
  );
}

export function LineSkeleton({ className }: { className?: string }) {
  return <div className={cn("h-4 animate-pulse rounded bg-gray-200", className)} />;
}

export function ImageSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />;
}

export function TextBlockSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <LineSkeleton key={i} className={i === lines - 1 ? "w-2/3" : "w-full"} />
      ))}
    </div>
  );
}

export function ButtonSkeleton({ className }: { className?: string }) {
  return <div className={cn("mt-6 h-10 w-full animate-pulse rounded-lg bg-gray-200", className)} />;
}

export function CardSkeleton({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 rounded-lg bg-white p-4 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      {children}
    </div>
  );
}
