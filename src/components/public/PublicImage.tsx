"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type PublicImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string | null | undefined;
  fallbackLabel?: string;
};

function PublicImage({
  alt,
  className,
  fallbackLabel = "تصویر موجود نیست",
  src,
  ...props
}: PublicImageProps) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={fallbackLabel}
        className={cn(
          "flex min-h-40 items-center justify-center bg-slate-100 p-4 text-center text-sm leading-7 text-slate-500",
          className
        )}
      >
        {fallbackLabel}
      </div>
    );
  }

  return (
    <Image {...props} src={src} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}

export { PublicImage };
