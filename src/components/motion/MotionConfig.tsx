"use client";

import {
  MotionConfig as MotionProvider,
  type MotionConfigProps as MotionProviderProps,
} from "motion/react";

export type MotionConfigProps = MotionProviderProps;

function MotionConfig({ reducedMotion = "user", transition, ...props }: MotionConfigProps) {
  return (
    <MotionProvider
      {...props}
      reducedMotion={reducedMotion}
      transition={transition ?? { duration: 0.35, ease: "easeOut" }}
    />
  );
}

export { MotionConfig };
