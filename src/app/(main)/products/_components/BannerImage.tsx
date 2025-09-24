"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function BannerImage({ src, alt }: { src: string; alt?: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative mb-5 w-full" style={{ aspectRatio: "1920 / 600" }}>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse rounded-md bg-gray-700/60"
          aria-hidden="true"
        />
      )}
      <Image
        src={src}
        alt={alt || "Category banner"}
        fill
        sizes="100vw"
        priority
        className={`rounded-md object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoadingComplete={() => setLoaded(true)}
      />
      {/* Dashed border when loaded */}
      <div
        className={`pointer-events-none absolute -inset-2 rounded-md border-2 border-dotted ${
          loaded ? "border-gray-400 opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
