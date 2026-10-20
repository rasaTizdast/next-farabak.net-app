"use client";

import { Pause, Play, Rotate3D } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import CameraPoster from "./CameraPoster";
import styles from "./landing.module.css";
import type { SceneController } from "./security-scene";

type SceneMode = "static" | "loading" | "ready" | "unavailable";

export default function SecurityScene() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestScene = useRef<() => void>(() => {});
  const toggleMotion = useRef<() => void>(() => {});
  const [mode, setMode] = useState<SceneMode>("static");
  const [paused, setPaused] = useState(false);
  const [allowInteraction, setAllowInteraction] = useState(true);

  useEffect(() => {
    const viewport = viewportRef.current;
    const container = containerRef.current;
    if (!viewport || !container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    let controller: SceneController | undefined;
    let mounted = true;
    let loading = false;
    let visible = false;
    let userPaused = false;
    let manuallyRequested = false;
    let pageLoaded = document.readyState === "complete";
    let idleHandle: number | undefined;

    const permitted = () => !reduced.matches && !connection?.saveData;
    const updateActivity = () =>
      controller?.setActive(
        visible &&
          !userPaused &&
          !document.hidden &&
          permitted() &&
          (desktop.matches || manuallyRequested)
      );

    const initialize = async () => {
      if (!mounted || loading || controller || !permitted()) return;
      loading = true;
      setMode("loading");
      try {
        const { createSecurityScene } = await import("./security-scene");
        if (!mounted || !permitted() || (!desktop.matches && !manuallyRequested)) return;
        controller = createSecurityScene(container);
        setMode("ready");
        updateActivity();
      } catch {
        if (mounted) setMode("unavailable");
      } finally {
        loading = false;
      }
    };
    const maybeAutoLoad = () => {
      if (!pageLoaded || !visible || !desktop.matches || !permitted() || loading || controller)
        return;
      if ("requestIdleCallback" in window) {
        if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
        idleHandle = window.requestIdleCallback(
          () => {
            void initialize();
          },
          { timeout: 1800 }
        );
      } else {
        void initialize();
      }
    };
    const onLoad = () => {
      pageLoaded = true;
      maybeAutoLoad();
    };
    const onVisibility = () => {
      updateActivity();
      if (!document.hidden) maybeAutoLoad();
    };
    const onPreferences = () => {
      setAllowInteraction(permitted());
      if (!permitted() || (!desktop.matches && !manuallyRequested)) {
        controller?.dispose();
        controller = undefined;
        userPaused = false;
        setPaused(false);
        setMode("static");
      } else {
        updateActivity();
        maybeAutoLoad();
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!controller || !desktop.matches || userPaused || !visible || document.hidden) return;
      const bounds = viewport.getBoundingClientRect();
      controller.setPointer(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      );
    };
    const onPointerLeave = () => controller?.setPointer(0, 0);
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        updateActivity();
        maybeAutoLoad();
      },
      { threshold: 0.08 }
    );
    observer.observe(viewport);
    requestScene.current = () => {
      manuallyRequested = true;
      void initialize();
    };
    toggleMotion.current = () => {
      userPaused = !userPaused;
      setPaused(userPaused);
      updateActivity();
    };
    onPreferences();
    viewport.addEventListener("pointermove", onPointerMove, { passive: true });
    viewport.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("load", onLoad, { once: true });
    reduced.addEventListener("change", onPreferences);
    desktop.addEventListener("change", onPreferences);
    return () => {
      mounted = false;
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      observer.disconnect();
      controller?.dispose();
      requestScene.current = () => {};
      toggleMotion.current = () => {};
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("load", onLoad);
      reduced.removeEventListener("change", onPreferences);
      desktop.removeEventListener("change", onPreferences);
    };
  }, []);

  return (
    <figure className={styles.scene} data-ready={mode === "ready"}>
      <div ref={viewportRef} className={styles.sceneViewport} aria-hidden="true">
        <div className={styles.scenePoster}>
          <CameraPoster />
        </div>
        <div ref={containerRef} className={styles.sceneCanvas} />
      </div>
      <figcaption className={styles.sceneCaption}>
        <span className={styles.sceneLabel}>نمای مفهومی از یک سیستم نظارتی یکپارچه</span>
        {allowInteraction && mode !== "unavailable" && (
          <button
            type="button"
            className={styles.sceneControl}
            aria-pressed={mode === "ready" ? !paused : undefined}
            aria-busy={mode === "loading"}
            disabled={mode === "loading"}
            onClick={() => (mode === "ready" ? toggleMotion.current() : requestScene.current())}
          >
            {mode === "ready" ? (
              paused ? (
                <Play size={13} aria-hidden="true" />
              ) : (
                <Pause size={13} aria-hidden="true" />
              )
            ) : (
              <Rotate3D size={14} aria-hidden="true" />
            )}
            {mode === "ready" ? (paused ? "ادامهٔ حرکت" : "توقف حرکت") : "نمای سه‌بعدی"}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
