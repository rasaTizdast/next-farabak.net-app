"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface BlogCoverProps {
  alt: string;
  className?: string;
  height: number;
  priority?: boolean;
  sizes?: string;
  src: string | null;
  width: number;
}

const BlogCover = ({
  alt,
  className,
  height,
  priority = false,
  sizes,
  src,
  width,
}: BlogCoverProps) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label="تصویر مقاله موجود نیست"
        className={`flex min-h-48 items-center justify-center bg-(--farabak-paper) p-6 text-center text-sm leading-7 text-(--farabak-ink-muted) ${className ?? ""}`}
      >
        تصویر مقاله موجود نیست
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || "تصویر مقاله"}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

export default BlogCover;
