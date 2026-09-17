"use client";

import Image, { type ImageProps } from "next/image";
import { useState, useEffect } from "react";

type SmartImageProps = Omit<ImageProps, "onLoadingComplete" | "placeholder" | "blurDataURL"> & {
  alt: string;
};

// 1x1 gray pixel (#cccccc) base64 - visible blur placeholder
const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGM4c+YMAATMAmU5mmUsAAAAAElFTkSuQmCC";

export default function SmartImage({
  className,
  priority = false,
  alt,
  style,
  fill,
  sizes,
  ...props
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Handle both load and error events for reliability
  useEffect(() => {
    const timer = setTimeout(() => {
      // Fallback: if image hasn't loaded after 3s, show it anyway
      // This handles edge cases where onLoadingComplete doesn't fire
      setLoaded(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Image
      alt={alt}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      className={`transition-opacity duration-700 ease-out ${
        loaded || error ? "opacity-100" : "opacity-0"
      } ${className ?? ""}`}
      onLoad={() => setLoaded(true)}
      onError={() => {
        setError(true);
        setLoaded(true);
      }}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      fill={fill}
      sizes={fill ? (sizes ?? "100vw") : undefined}
      style={style}
      {...props}
    />
  );
}
