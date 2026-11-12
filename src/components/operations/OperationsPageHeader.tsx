import * as React from "react";

import { cn } from "@/lib/utils";

export interface OperationsPageHeaderProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "title"
> {
  actions?: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
}

function OperationsPageHeader({
  actions,
  className,
  description,
  eyebrow,
  title,
  ...props
}: OperationsPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-slate-200 py-6 md:flex-row md:items-end md:justify-between md:gap-8",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-2">
        {eyebrow ? (
          <p className="text-sm font-semibold text-(--farabak-action-blue)">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-(--farabak-ink-deep) md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-7 text-(--farabak-ink-muted)">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

export { OperationsPageHeader };
