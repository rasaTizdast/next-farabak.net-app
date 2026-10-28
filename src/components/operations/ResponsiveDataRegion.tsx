import * as React from "react";

import { cn } from "@/lib/utils";

export interface ResponsiveDataRegionProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  children?: React.ReactNode;
  label: string;
  table: React.ReactNode;
}

function ResponsiveDataRegion({
  children,
  className,
  label,
  table,
  ...props
}: ResponsiveDataRegionProps) {
  const labelId = React.useId();

  return (
    <div dir="rtl" className={cn("w-full", className)} {...props}>
      <h2 id={labelId} className="sr-only">
        {label}
      </h2>
      <div
        className={cn(
          "w-full overflow-x-auto rounded-lg border border-slate-200 bg-white outline-none focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2",
          children && "hidden md:block"
        )}
        role="region"
        aria-labelledby={labelId}
        tabIndex={0}
      >
        {table}
      </div>
      {children ? <div className="space-y-3 md:hidden">{children}</div> : null}
    </div>
  );
}

export { ResponsiveDataRegion };
