"use client";

import { useEffect } from "react";

import "lenis/dist/lenis.css";

export default function LandingExperience() {
  useEffect(() => {
    const rootElement = document.getElementById("farabak-home");
    if (!rootElement) return;
    const root = rootElement;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    let disposed = false;
    let generation = 0;
    let observer: IntersectionObserver | undefined;
    let streamObserver: MutationObserver | undefined;
    let destroyScroll: (() => void) | undefined;
    let activeAnimations: { stop: () => void }[] = [];

    async function setup() {
      const currentGeneration = ++generation;
      observer?.disconnect();
      streamObserver?.disconnect();
      destroyScroll?.();
      destroyScroll = undefined;
      activeAnimations.forEach((animation) => animation.stop());
      activeAnimations = [];
      if (motionPreference.matches || connection?.saveData) return;
      const { animate } = await import("motion/mini");
      if (disposed || currentGeneration !== generation || motionPreference.matches) return;
      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              observer?.unobserve(entry.target);
              activeAnimations.push(
                animate(
                  entry.target as HTMLElement,
                  { opacity: [0.55, 1], transform: ["translateY(18px)", "translateY(0px)"] },
                  { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
                )
              );
            });
          },
          { threshold: 0.08 }
        );
        root.querySelectorAll("[data-reveal]").forEach((element) => observer?.observe(element));
        streamObserver = new MutationObserver((records) => {
          records.forEach((record) => {
            record.addedNodes.forEach((node) => {
              if (!(node instanceof Element)) return;
              if (node.matches("[data-reveal]")) observer?.observe(node);
              node
                .querySelectorAll("[data-reveal]")
                .forEach((element) => observer?.observe(element));
            });
          });
        });
        streamObserver.observe(root, { childList: true, subtree: true });
      }
      if (finePointer.matches) {
        const { default: Lenis } = await import("lenis");
        if (
          disposed ||
          currentGeneration !== generation ||
          motionPreference.matches ||
          !finePointer.matches
        )
          return;
        const previousBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        const lenis = new Lenis({
          autoRaf: true,
          smoothWheel: true,
          syncTouch: false,
          anchors: { offset: -96 },
          duration: 0.85,
        });
        destroyScroll = () => {
          lenis.destroy();
          document.documentElement.style.scrollBehavior = previousBehavior;
        };
      }
    }

    const onPreferenceChange = () => {
      void setup().catch(() => {});
    };
    void setup().catch(() => {
      /* Native content and scrolling are the fallback. */
    });
    motionPreference.addEventListener("change", onPreferenceChange);
    finePointer.addEventListener("change", onPreferenceChange);
    return () => {
      disposed = true;
      observer?.disconnect();
      streamObserver?.disconnect();
      destroyScroll?.();
      activeAnimations.forEach((animation) => animation.stop());
      motionPreference.removeEventListener("change", onPreferenceChange);
      finePointer.removeEventListener("change", onPreferenceChange);
    };
  }, []);
  return null;
}
