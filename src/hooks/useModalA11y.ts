"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

interface UseModalA11yOptions {
  /** Closes the modal (Escape, backdrop click are wired by the caller). */
  onClose: () => void;
  /** Set to false to keep the modal open while an internal modal is visible. */
  isOpen?: boolean;
  /**
   * Optional guard read on every Escape press. Return false to ignore the key,
   * e.g. while a nested progress modal is open or focus sits in a text field.
   */
  shouldCloseOnEscape?: () => boolean;
}

/**
 * Shared accessibility behaviour for dialog panels:
 * - moves focus to the panel on mount and restores it on unmount
 * - traps Tab focus inside the panel
 * - closes on Escape
 * - locks background page scrolling while open
 *
 * `onClose` is read through a ref so an unstable parent callback cannot
 * re-run the mount-only effects (which would steal focus while typing).
 */
export function useModalA11y<T extends HTMLElement>({
  onClose,
  isOpen = true,
  shouldCloseOnEscape,
}: UseModalA11yOptions) {
  const panelRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const shouldCloseRef = useRef(shouldCloseOnEscape);
  shouldCloseRef.current = shouldCloseOnEscape;

  useEffect(() => {
    if (!isOpenRef.current) return;

    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panel?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpenRef.current) return;
      if (event.key === "Escape") {
        if (shouldCloseRef.current && !shouldCloseRef.current()) return;
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const current = panelRef.current;
      if (!current) return;

      const focusable = Array.from(
        current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) {
        event.preventDefault();
        current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!current.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, []);

  return panelRef;
}
