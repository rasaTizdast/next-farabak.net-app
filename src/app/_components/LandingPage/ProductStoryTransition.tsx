"use client";

import { useEffect, useRef } from "react";

import styles from "./landing.module.css";

type SaveDataConnection = EventTarget & { saveData?: boolean };

/** A decorative, opt-in bridge between the X-ray and CEIA stories. */
export default function ProductStoryTransition() {
  const bridgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bridge = bridgeRef.current;
    if (!bridge) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const connection = (navigator as Navigator & { connection?: SaveDataConnection }).connection;

    const syncMotionEligibility = () => {
      const supportsScrollTimeline =
        CSS.supports("animation-timeline: view()") &&
        CSS.supports("animation-range: cover 30% cover 70%");
      bridge.dataset.scrollMotion = String(
        supportsScrollTimeline &&
          finePointer.matches &&
          !motionPreference.matches &&
          !connection?.saveData &&
          !document.hidden
      );
    };

    syncMotionEligibility();
    motionPreference.addEventListener("change", syncMotionEligibility);
    finePointer.addEventListener("change", syncMotionEligibility);
    connection?.addEventListener("change", syncMotionEligibility);
    document.addEventListener("visibilitychange", syncMotionEligibility);

    return () => {
      motionPreference.removeEventListener("change", syncMotionEligibility);
      finePointer.removeEventListener("change", syncMotionEligibility);
      connection?.removeEventListener("change", syncMotionEligibility);
      document.removeEventListener("visibilitychange", syncMotionEligibility);
      delete bridge.dataset.scrollMotion;
    };
  }, []);

  return (
    <div className={styles.storyTransition} ref={bridgeRef} aria-hidden="true">
      <svg viewBox="0 0 1000 80" preserveAspectRatio="none" focusable="false">
        <path d="M920 40H140V10H70V70H140" />
      </svg>
    </div>
  );
}
