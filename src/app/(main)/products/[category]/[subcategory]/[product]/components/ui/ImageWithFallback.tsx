"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  quality?: number;
  className?: string;
  loading?: "eager" | "lazy";
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  quality,
  className,
  loading,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return null;
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
