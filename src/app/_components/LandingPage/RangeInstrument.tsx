"use client";

import { ArrowDownLeft, ArrowUpLeft } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ActionLink } from "@/components/public/ActionLink";

type RangeItem = {
  key: string;
  categoryLabel: string;
  familyLabel: string;
  title: string;
  href: string;
  desktopSrc: string | null;
  mobileSrc: string | null;
  alt: string;
  mediaStatus: "editorial-illustration";
  caption: string;
};

type Props = { items: readonly RangeItem[] };

export default function RangeInstrument({ items }: Props) {
  const [activeKey, setActiveKey] = useState(items[0].key);
  const request = useRef(0);
  const stage = useRef<HTMLElement>(null);
  const picture = useRef<HTMLPictureElement>(null);
  const animation = useRef<{ stop: () => void } | null>(null);
  const introAnimation = useRef<{ stop: () => void } | null>(null);
  const firstChange = useRef(true);
  const active = items.find((item) => item.key === activeKey) ?? items[0];

  useEffect(() => {
    const target = picture.current;
    let cancelled = false;
    if (
      target &&
      !document.hidden &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    ) {
      void import("motion/mini")
        .then(({ animate }) => {
          if (cancelled || !target.isConnected) return;
          introAnimation.current = animate(
            target,
            {
              clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
              transform: ["scale(1.07)", "scale(1)"],
            },
            { duration: 1.15, ease: [0.76, 0, 0.24, 1] }
          );
        })
        .catch(() => {
          // The visible image is the fallback.
        });
    }
    return () => {
      cancelled = true;
      request.current += 1;
      animation.current?.stop();
      introAnimation.current?.stop();
      target?.style.removeProperty("clip-path");
      target?.style.removeProperty("transform");
    };
  }, []);

  useEffect(() => {
    if (firstChange.current) {
      firstChange.current = false;
      return;
    }
    const target = stage.current;
    if (!target || document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
      return;
    let cancelled = false;
    void import("motion/mini")
      .then(({ animate }) => {
        if (cancelled || !target.isConnected) return;
        animation.current?.stop();
        animation.current = animate(
          target,
          { opacity: [0.55, 1], transform: ["scale(0.965)", "scale(1)"] },
          { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
        );
      })
      .catch(() => {
        // The static picture remains readable if the optional motion module is unavailable.
      });
    return () => {
      cancelled = true;
      animation.current?.stop();
      target.style.removeProperty("opacity");
      target.style.removeProperty("transform");
    };
  }, [activeKey]);

  function select(item: RangeItem) {
    if (item.key === activeKey) return;
    const current = ++request.current;
    const source = window.matchMedia("(max-width: 767px)").matches
      ? item.mobileSrc
      : item.desktopSrc;
    if (!source) {
      setActiveKey(item.key);
      return;
    }
    const image = new window.Image();
    image.onload = () => {
      if (request.current === current) setActiveKey(item.key);
    };
    image.src = source;
    if (image.complete && image.naturalWidth && request.current === current) {
      setActiveKey(item.key);
    }
  }

  return (
    <div className="min-w-0">
      <div className="relative">
        <div
          className="absolute -top-5 -left-5 h-[75%] w-[72%] bg-[#1265e8] md:-top-8 md:-left-8"
          aria-hidden="true"
        />
        <figure
          ref={stage}
          className="relative overflow-hidden bg-[#163c5d] [clip-path:polygon(0_0,calc(100%-32px)_0,100%_32px,100%_100%,32px_100%,0_calc(100%-32px))]"
          data-reveal
          data-reveal-kind="image"
        >
          {active.desktopSrc ? (
            <picture ref={picture} className="block aspect-5/4 md:aspect-4/3 lg:aspect-6/5">
              {active.mobileSrc && (
                <source media="(max-width: 767px)" srcSet={active.mobileSrc} type="image/webp" />
              )}
              <Image
                src={active.desktopSrc}
                alt={active.alt}
                width={1536}
                height={1024}
                sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1200px) 50vw, 60vw"
                loading="eager"
                fetchPriority="high"
                unoptimized
                className="size-full object-cover"
              />
            </picture>
          ) : (
            <div className="grid aspect-5/4 place-items-center p-8 text-center text-white">
              تصویر این حوزه در دست آماده‌سازی است.
            </div>
          )}
          <figcaption className="absolute inset-x-0 bottom-0 bg-[#061a30]/92 px-5 py-4 text-white md:px-7">
            <span className="flex flex-wrap items-center justify-between gap-2">
              <strong className="text-base md:text-lg">
                <bdi lang="en" dir="ltr">
                  {active.familyLabel}
                </bdi>
                {" · "}
                {active.categoryLabel}
              </strong>
              <ActionLink
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white underline underline-offset-5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#56bcff]"
                href={active.href}
                variant="quiet"
              >
                دیدن این حوزه <ArrowUpLeft size={16} strokeWidth={1.4} aria-hidden="true" />
              </ActionLink>
            </span>
            <span className="mt-1 block text-sm leading-6 text-[#d3e4f0]">{active.caption}</span>
          </figcaption>
        </figure>
      </div>
      <nav id="range-select" className="mt-7 scroll-mt-28" aria-label="انتخاب حوزه برای پیش‌نمایش">
        <p className="mb-3 flex items-center gap-2 text-sm text-[#bfd5e6]">
          <ArrowDownLeft size={16} strokeWidth={1.4} aria-hidden="true" />
          یک حوزه را انتخاب کنید
        </p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <li key={item.key} className="min-w-0">
              <button
                type="button"
                aria-pressed={item.key === activeKey}
                aria-label={`پیش‌نمایش ${item.categoryLabel}`}
                onClick={() => select(item)}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") select(item);
                }}
                className={`flex min-h-15 w-full items-center justify-between gap-2 p-3 text-right text-sm font-semibold transition-[transform,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#56bcff] disabled:cursor-default ${item.key === activeKey ? "bg-[#d9edff] text-[#09243b]" : "bg-[#183954] text-white hover:bg-[#265374]"}`}
              >
                {item.categoryLabel}
                <span
                  className={`size-2 shrink-0 rotate-45 ${item.key === activeKey ? "bg-[#1265e8]" : "bg-[#81a5bf]"}`}
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-[#c2d7e8]" aria-live="polite">
          {active.title}
        </p>
      </nav>
    </div>
  );
}
