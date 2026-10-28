import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex min-h-8 items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold leading-5",
  {
    variants: {
      status: {
        danger: "border-rose-200 bg-rose-50 text-rose-800",
        info: "border-blue-200 bg-blue-50 text-blue-800",
        neutral: "border-slate-200 bg-slate-50 text-slate-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-800",
        warning: "border-amber-200 bg-amber-50 text-amber-800",
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {}

function StatusBadge({ children, className, status, ...props }: StatusBadgeProps) {
  return (
    <span {...props} role="status" className={cn(statusBadgeVariants({ status }), className)}>
      {children}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants };
