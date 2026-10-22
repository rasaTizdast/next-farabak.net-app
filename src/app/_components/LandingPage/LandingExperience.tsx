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
    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
          addEventListener?: (type: "change", listener: () => void) => void;
          removeEventListener?: (type: "change", listener: () => void) => void;
        };
      }
    ).connection;
    let disposed = false;
    let generation = 0;
    let observer: IntersectionObserver | undefined;
    let streamObserver: MutationObserver | undefined;
    let destroyScroll: (() => void) | undefined;
    let activeAnimations: { stop: () => void }[] = [];
    const revealed = new WeakSet<Element>();
    const revealSelector = "[data-reveal]";

    function stopAnimations() {
      activeAnimations.forEach((animation) => animation.stop());
      activeAnimations = [];
      root.querySelectorAll<HTMLElement>(revealSelector).forEach((element) => {
        element.style.removeProperty("opacity");
        element.style.removeProperty("transform");
      });
    }

    async function setup() {
      const currentGeneration = ++generation;
      observer?.disconnect();
      streamObserver?.disconnect();
      destroyScroll?.();
      destroyScroll = undefined;
      stopAnimations();
      if (motionPreference.matches || connection?.saveData || document.hidden) return;
      const { animate } = await import("motion/mini");
      if (
        disposed ||
        currentGeneration !== generation ||
        motionPreference.matches ||
        connection?.saveData ||
        document.hidden
      )
        return;
      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              observer?.unobserve(entry.target);
              if (revealed.has(entry.target)) return;
              revealed.add(entry.target);
              const target = entry.target as HTMLElement;
              const image = target.dataset.revealKind === "image";
              const order = Number(target.dataset.revealOrder ?? 0);
              activeAnimations.push(
                animate(
                  target,
                  {
                    opacity: [0, 1],
                    transform: [
                      image ? "translateY(34px) scale(0.975)" : "translateY(22px)",
                      "translateY(0px) scale(1)",
                    ],
                  },
                  {
                    duration: image ? 0.92 : 0.74,
                    delay: Math.min(order, 7) * 0.075,
                    ease: [0.22, 1, 0.36, 1],
                  }
                )
              );
            });
          },
          { threshold: 0.08 }
        );
        root.querySelectorAll(revealSelector).forEach((element) => {
          if (!revealed.has(element)) observer?.observe(element);
        });
        streamObserver = new MutationObserver((records) => {
          records.forEach((record) => {
            record.addedNodes.forEach((node) => {
              if (!(node instanceof Element)) return;
              if (node.matches(revealSelector) && !revealed.has(node)) observer?.observe(node);
              node.querySelectorAll(revealSelector).forEach((element) => {
                if (!revealed.has(element)) observer?.observe(element);
              });
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
          !finePointer.matches ||
          connection?.saveData ||
          document.hidden
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
    connection?.addEventListener?.("change", onPreferenceChange);
    document.addEventListener("visibilitychange", onPreferenceChange);
    return () => {
      disposed = true;
      generation += 1;
      observer?.disconnect();
      streamObserver?.disconnect();
      destroyScroll?.();
      stopAnimations();
      motionPreference.removeEventListener("change", onPreferenceChange);
      finePointer.removeEventListener("change", onPreferenceChange);
      connection?.removeEventListener?.("change", onPreferenceChange);
      document.removeEventListener("visibilitychange", onPreferenceChange);
    };
  }, []);
  return null;
}
