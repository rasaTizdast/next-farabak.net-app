"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import styles from "./landing.module.css";

type RangeItemBase = {
  key: string;
  familyLabel: string;
  categoryLabel: string;
  href: string;
  alt: string;
};
type RangeItem = RangeItemBase &
  (
    | {
        mediaStatus: "generated-conceptual" | "generated-product-render" | "approved-real-media";
        desktopSrc: string;
        mobileSrc: string;
      }
    | { mediaStatus: "pending-media"; desktopSrc: null; mobileSrc: null }
  );

type Props = { items: readonly RangeItem[]; children: ReactNode };

/** The first frame and story links render on the server; selection enhances the preview. */
export default function ProductRangeFocus({ items, children }: Props) {
  const [activeKey, setActiveKey] = useState(items[0].key);
  const [ready, setReady] = useState(false);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const request = useRef(0);
  const picture = useRef<HTMLPictureElement>(null);
  const animation = useRef<{ stop: () => void } | null>(null);
  const firstRender = useRef(true);
  const active = items.find((item) => item.key === activeKey) ?? items[0];

  useEffect(() => {
    setReady(true);
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
          addEventListener?: (type: "change", listener: () => void) => void;
          removeEventListener?: (type: "change", listener: () => void) => void;
        };
      }
    ).connection;
    const stopWhenPaused = () => {
      if (!document.hidden && !motionPreference.matches && !connection?.saveData) return;
      animation.current?.stop();
      picture.current?.style.removeProperty("opacity");
      picture.current?.style.removeProperty("transform");
    };
    document.addEventListener("visibilitychange", stopWhenPaused);
    motionPreference.addEventListener("change", stopWhenPaused);
    connection?.addEventListener?.("change", stopWhenPaused);
    return () => {
      request.current += 1;
      animation.current?.stop();
      document.removeEventListener("visibilitychange", stopWhenPaused);
      motionPreference.removeEventListener("change", stopWhenPaused);
      connection?.removeEventListener?.("change", stopWhenPaused);
    };
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    animation.current?.stop();
    const target = picture.current;
    if (!target || document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (connection?.saveData) return;

    let cancelled = false;
    void import("motion/mini")
      .then(({ animate }) => {
        const liveConnection = (navigator as Navigator & { connection?: { saveData?: boolean } })
          .connection;
        if (
          cancelled ||
          document.hidden ||
          !target.isConnected ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
          liveConnection?.saveData
        )
          return;
        animation.current = animate(
          target,
          { opacity: [0.45, 1], transform: ["scale(1.018)", "scale(1)"] },
          { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
        );
      })
      .catch(() => {
        // The already rendered image is the static fallback if Motion cannot load.
      });
    return () => {
      cancelled = true;
      animation.current?.stop();
    };
  }, [activeKey]);

  function focusItem(item: RangeItem) {
    if (item.key === activeKey) {
      request.current += 1;
      return;
    }
    const currentRequest = ++request.current;
    if (item.mediaStatus === "pending-media") {
      setFailedKey(null);
      setActiveKey(item.key);
      return;
    }
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const src = mobile ? item.mobileSrc : item.desktopSrc;
    const candidate = new window.Image();
    candidate.onload = () => {
      if (request.current === currentRequest) {
        setFailedKey(null);
        setActiveKey(item.key);
      }
    };
    candidate.onerror = () => {
      // Preserve the last good preview if a conceptual image is unavailable.
    };
    candidate.src = src;
    if (candidate.complete && candidate.naturalWidth && request.current === currentRequest) {
      setFailedKey(null);
      setActiveKey(item.key);
    }
  }

  return (
    <>
      <div className={styles.heroGrid}>
        {children}
        <figure className={`${styles.heroArtwork} ${styles.rangeHeroArtwork}`} data-ui>
          {active.mediaStatus === "pending-media" || failedKey === active.key ? (
            <span className={styles.rangeMediaFallback}>تصویر این حوزه در دست آماده‌سازی است.</span>
          ) : (
            <picture ref={picture}>
              <source
                media="(max-width: 767px)"
                srcSet={active.mobileSrc}
                type="image/webp"
                width={800}
                height={1000}
              />
              <Image
                src={active.desktopSrc}
                alt={active.alt}
                width={1536}
                height={1024}
                sizes="(max-width: 767px) 100vw, 54vw"
                loading="eager"
                fetchPriority={activeKey === items[0].key ? "high" : "auto"}
                unoptimized
                onError={() => setFailedKey(active.key)}
              />
            </picture>
          )}
          <figcaption className={styles.rangeHeroCaption} aria-live="polite" aria-atomic="true">
            <span className={styles.rangeStageIdentity}>
              <strong>
                <bdi lang="en" dir="ltr">
                  {active.familyLabel}
                </bdi>{" "}
                / {active.categoryLabel}
              </strong>
              <span>
                {active.mediaStatus === "pending-media" || failedKey === active.key
                  ? "تصویر این حوزه در دست آماده‌سازی است."
                  : active.mediaStatus === "approved-real-media"
                    ? "تصویر تأییدشده برای این بخش."
                    : active.mediaStatus === "generated-product-render"
                      ? "بازآفرینی هوش مصنوعی بر پایه مرجع محصول؛ عکس رسمی سازنده یا نصب واقعی نیست."
                      : "فضای کاربرد؛ تصویر محصول یا پروژه واقعی نیست."}
              </span>
            </span>
            <Link className={styles.rangeStageAction} href={active.href}>
              راهنمای این دسته
            </Link>
          </figcaption>
        </figure>
      </div>
      <nav id="range-select" className={styles.rangeNav} aria-label="انتخاب حوزه برای پیش‌نمایش">
        <ol className={styles.rangeList}>
          {items.map((item) => (
            <li key={item.key} data-active={item.key === activeKey || undefined}>
              <button
                className={styles.rangeOption}
                type="button"
                disabled={!ready}
                aria-pressed={item.key === activeKey}
                aria-label={`پیش‌نمایش ${item.familyLabel}، ${item.categoryLabel}`}
                onFocus={() => focusItem(item)}
                onPointerEnter={() => focusItem(item)}
                onClick={() => focusItem(item)}
              >
                <bdi lang="en" dir="ltr">
                  {item.familyLabel}
                </bdi>
                <strong>{item.categoryLabel}</strong>
              </button>
              <Link className={styles.rangeAnchor} href={item.href}>
                جزئیات این حوزه
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
