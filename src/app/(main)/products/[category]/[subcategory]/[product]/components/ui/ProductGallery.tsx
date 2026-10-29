"use client";

import { useState } from "react";

import ImageWithFallback from "./ImageWithFallback";

interface ProductGalleryProps {
  title: string;
  images: Array<string | null | undefined>;
}

export default function ProductGallery({ title, images }: ProductGalleryProps) {
  const availableImages = images.length > 0 ? images : [null];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = availableImages[selectedIndex] ?? null;

  return (
    <section aria-labelledby="product-gallery-title" className="h-full min-w-0">
      <h2 id="product-gallery-title" className="sr-only">
        تصاویر {title}
      </h2>
      <div className="flex aspect-video h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-(--farabak-ink-deep)/10 bg-white p-2 shadow-[0_18px_45px_rgba(6,26,48,0.08)] sm:p-6 lg:aspect-auto">
        <ImageWithFallback
          key={`${selectedIndex}-${selectedImage ?? "missing"}`}
          src={selectedImage}
          alt={`تصویر ${title}`}
          fallbackLabel="تصویر محصول موجود نیست"
          width={1340}
          height={780}
          quality={75}
          loading="eager"
          className="size-full min-h-0 max-w-full min-w-0 flex-1 object-contain"
        />
        {availableImages.length > 1 ? (
          <div
            className="mt-4 flex gap-3 overflow-x-auto pb-1"
            role="list"
            aria-label="انتخاب تصویر"
          >
            {availableImages.map((image, index) => (
              <button
                key={`${image ?? "missing"}-${index}`}
                type="button"
                aria-label={`تصویر ${index === 0 ? "اصلی" : `شماره ${index + 1}`} ${title}`}
                aria-pressed={selectedIndex === index}
                onClick={() => setSelectedIndex(index)}
                className="size-16 shrink-0 overflow-hidden rounded-lg border-2 border-transparent bg-white p-1 transition-[border-color,box-shadow] hover:border-(--farabak-action-blue)/50 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none sm:size-20"
              >
                <ImageWithFallback
                  src={image ?? null}
                  alt=""
                  fallbackLabel="تصویر موجود نیست"
                  width={160}
                  height={160}
                  loading="lazy"
                  className="size-full object-contain"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
