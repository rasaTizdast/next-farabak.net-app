import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import NoPrefetchLink from "@/components/NoPrefetchLink";
import { cn } from "@/lib/utils";

const actionLinkVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-(--farabak-action-blue) text-white hover:bg-(--farabak-action-blue)/90",
        secondary:
          "border border-(--farabak-ink-deep)/20 bg-white text-(--farabak-ink-deep) hover:bg-slate-50",
        quiet:
          "text-(--farabak-ink-deep) underline-offset-4 hover:text-(--farabak-action-blue) hover:underline",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface ActionLinkProps
  extends
    Omit<ComponentProps<typeof NoPrefetchLink>, "className">,
    VariantProps<typeof actionLinkVariants> {
  className?: string;
  current?: boolean;
}

function ActionLink({ className, current, variant, ...props }: ActionLinkProps) {
  const ariaCurrent = current ? "page" : props["aria-current"];

  return (
    <NoPrefetchLink
      {...props}
      aria-current={ariaCurrent}
      className={cn(actionLinkVariants({ variant }), className)}
    />
  );
}

export { ActionLink, actionLinkVariants };
