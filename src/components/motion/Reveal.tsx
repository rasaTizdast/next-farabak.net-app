"use client";

import { useInView, useReducedMotion, motion } from "motion/react";
import * as React from "react";

export type RevealProps = Omit<React.ComponentPropsWithoutRef<typeof motion.div>, "children"> & {
  children?: React.ReactNode;
  amount?: number;
  delay?: number;
  once?: boolean;
};

function Reveal({ amount = 0.2, children, delay = 0, once = true, ...props }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount, once });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      {...props}
      ref={ref}
      initial={false}
      animate={isInView || prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.35,
        delay: prefersReducedMotion ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}

export { Reveal };
