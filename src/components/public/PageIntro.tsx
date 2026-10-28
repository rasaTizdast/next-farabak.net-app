import * as React from "react";

import { cn } from "@/lib/utils";

export interface PageIntroProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  actions?: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
}

function PageIntro({
  actions,
  children,
  className,
  description,
  eyebrow,
  title,
  ...props
}: PageIntroProps) {
  return (
    <header className={cn("flex flex-col gap-5 py-10 md:gap-6 md:py-16", className)} {...props}>
      {eyebrow ? (
        <p className="text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-col gap-4 md:max-w-3xl">
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-(--farabak-ink-deep) md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="text-base leading-8 text-(--farabak-ink-muted)">{description}</p>
        ) : null}
      </div>
      {actions || children ? (
        <div className="flex flex-wrap items-center gap-3">{actions ?? children}</div>
      ) : null}
    </header>
  );
}

export { PageIntro };
