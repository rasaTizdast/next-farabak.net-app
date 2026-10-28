"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  quality?: number;
  className?: string;
  loading?: "eager" | "lazy";
  fallbackLabel?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  quality,
  className,
  loading,
  fallbackLabel = "تصویر محصول موجود نیست",
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={fallbackLabel}
        className={`flex aspect-square items-center justify-center rounded-xl bg-(--farabak-paper) p-6 text-center text-sm leading-7 text-(--farabak-ink-muted) ${className ?? ""}`}
      >
        {fallbackLabel}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      loading={loading}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
