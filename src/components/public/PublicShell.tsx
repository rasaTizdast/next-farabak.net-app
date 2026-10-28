import * as React from "react";

import { cn } from "@/lib/utils";

type PublicShellElement = "div" | "main" | "section";

export interface PublicShellProps extends React.HTMLAttributes<HTMLElement> {
  as?: PublicShellElement;
}

const publicShellClasses =
  "mx-auto w-full max-w-[1580px] px-6 md:px-12 min-[992px]:px-16 min-[1200px]:px-24 2xl:px-40";

function PublicShell({
  as: Component = "div",
  className,
  dir = "rtl",
  ...props
}: PublicShellProps) {
  return <Component dir={dir} className={cn(publicShellClasses, className)} {...props} />;
}

export { PublicShell, publicShellClasses };
