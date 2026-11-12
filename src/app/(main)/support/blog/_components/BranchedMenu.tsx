"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "lucide-react";
import {
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
} from "react";

import styles from "./BranchedMenu.module.css";

type HugeIcon = NonNullable<ComponentProps<typeof HugeiconsIcon>["icon"]>;

export type BranchedMenuChild = {
  value: string;
  label: string;
  icon?: HugeIcon | ReactElement;
};

export type BranchedMenuItem = {
  value?: string;
  label: string;
  icon?: HugeIcon | ReactElement;
  children?: BranchedMenuChild[];
};

type BranchedMenuProps = {
  items: BranchedMenuItem[];
  ariaLabel: string;
  defaultOpen?: number | number[];
  defaultActive?: string;
  activeValue?: string;
  onSelect?: (value: string, item: BranchedMenuItem | BranchedMenuChild) => void;
  onToggle?: (index: number, open: boolean) => void;
  color?: string;
  accentColor?: string;
  lineColor?: string;
  width?: number;
  rowHeight?: number;
  indent?: number;
  trunk?: number;
  radius?: number;
  lineWidth?: number;
  fontSize?: number;
  drawDuration?: number;
  foldDuration?: number;
  className?: string;
};

const PAD = 6;
const MARK = 16;

function toSet(open: number | number[]) {
  return new Set(Array.isArray(open) ? open : open >= 0 ? [open] : []);
}

function getValue(item: BranchedMenuItem) {
  return item.value ?? item.label;
}

function renderIcon(icon?: HugeIcon | ReactElement) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;

  return <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} />;
}

export default function BranchedMenu({
  items,
  ariaLabel,
  defaultOpen = 0,
  defaultActive = "",
  activeValue,
  onSelect,
  onToggle,
  color = "#061a30",
  accentColor = "#1265e8",
  lineColor = "#cbd5e1",
  width = 340,
  rowHeight = 42,
  indent = 38,
  trunk = 14,
  radius = 10,
  lineWidth = 1.5,
  fontSize = 14,
  drawDuration = 360,
  foldDuration = 260,
  className = "",
}: BranchedMenuProps) {
  const [open, setOpen] = useState(() => toSet(defaultOpen));
  const [internalActive, setInternalActive] = useState(() => {
    if (defaultActive) return defaultActive;
    const firstOpenSection = items.find(
      (item, index) => item.children && toSet(defaultOpen).has(index)
    );
    return (
      firstOpenSection?.children?.[0]?.value ?? (firstOpenSection ? getValue(firstOpenSection) : "")
    );
  });
  const instanceId = useId().replaceAll(":", "");
  const active = activeValue ?? internalActive;
  const navRef = useRef<HTMLElement>(null);
  const heads = useRef<Array<HTMLAnchorElement | null>>([]);
  const markerRef = useRef<HTMLSpanElement>(null);
  const trees = useRef<Array<HTMLDivElement | null>>([]);
  const [treeMetrics, setTreeMetrics] = useState<
    Record<number, { height: number; rowCenters: number[] }>
  >({});

  const activeSection = items.findIndex(
    (item) => getValue(item) === active || item.children?.some((child) => child.value === active)
  );

  useLayoutEffect(() => {
    const placeMarker = (glide: boolean) => {
      const marker = markerRef.current;
      const head = heads.current[activeSection];
      const nav = navRef.current;
      if (!marker || !nav) return;

      const on = activeSection >= 0 && Boolean(head);
      if (!glide) marker.style.transition = "none";
      if (on && head) {
        const navRect = nav.getBoundingClientRect();
        const headRect = head.getBoundingClientRect();
        marker.style.top = `${headRect.top - navRect.top + (headRect.height - MARK) / 2}px`;
      }
      marker.toggleAttribute("data-on", on);
      if (!glide) {
        void marker.offsetHeight;
        marker.style.transition = "";
      }
    };

    const measureTrees = () => {
      const next: Record<number, { height: number; rowCenters: number[] }> = {};
      trees.current.forEach((tree, index) => {
        if (!tree) return;
        const rows = Array.from(tree.querySelectorAll<HTMLElement>("[data-branch-row]"));
        const treeTop = tree.getBoundingClientRect().top;
        next[index] = {
          height: tree.scrollHeight,
          rowCenters: rows.map((row) => {
            const rect = row.getBoundingClientRect();
            return rect.top - treeTop + rect.height / 2;
          }),
        };
      });

      setTreeMetrics((current) => {
        const same =
          Object.keys(next).length === Object.keys(current).length &&
          Object.entries(next).every(([index, metrics]) => {
            const previous = current[Number(index)];
            return (
              previous?.height === metrics.height &&
              previous.rowCenters.length === metrics.rowCenters.length &&
              previous.rowCenters.every(
                (center, rowIndex) => center === metrics.rowCenters[rowIndex]
              )
            );
          });
        return same ? current : next;
      });
    };

    placeMarker(true);
    measureTrees();

    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      placeMarker(false);
      measureTrees();
    });
    observer.observe(nav);
    trees.current.forEach((tree) => tree && observer.observe(tree));
    return () => observer.disconnect();
  }, [activeSection, fontSize, indent, items, rowHeight]);

  const select = (value: string, item: BranchedMenuItem | BranchedMenuChild) => {
    setInternalActive(value);
    onSelect?.(value, item);
  };

  const toggle = (index: number) => {
    const isOpen = !open.has(index);
    onToggle?.(index, isOpen);
    setOpen((previous) => {
      const next = new Set(previous);
      if (isOpen) next.add(index);
      else next.delete(index);
      return next;
    });
  };

  const style = {
    "--bm-w": `${width}px`,
    "--bm-ink": color,
    "--bm-accent": accentColor,
    "--bm-line": lineColor,
    "--bm-font": `${fontSize}px`,
    "--bm-row": `${rowHeight}px`,
    "--bm-indent": `${indent}px`,
    "--bm-line-w": lineWidth,
    "--bm-draw": `${drawDuration}ms`,
    "--bm-fold": `${foldDuration}ms`,
  } as CSSProperties;

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      dir="rtl"
      className={`${styles.menu}${className ? ` ${className}` : ""}`}
      style={style}
    >
      <span ref={markerRef} className={styles.marker} aria-hidden="true" />
      <ol className={styles.sections}>
        {items.map((item, index) => {
          const value = getValue(item);
          const children = item.children;
          const hasChildren = Boolean(children?.length);
          const isOpen = hasChildren && open.has(index);
          const isActive = value === active;
          const bodyId = `${instanceId}-branched-menu-${index}`;
          const fallbackCenters =
            children?.map((_, childIndex) => PAD + (childIndex + 0.5) * rowHeight) ?? [];
          const rowCenters = treeMetrics[index]?.rowCenters ?? fallbackCenters;
          const treeHeight =
            treeMetrics[index]?.height ?? PAD * 2 + (children?.length ?? 0) * rowHeight;
          const branchRadius = Math.min(radius, rowHeight / 2 - 2);
          const endX = indent - 8;
          const branchPath = (childIndex: number) => {
            const y = rowCenters[childIndex] ?? fallbackCenters[childIndex];
            return `M ${trunk} ${y - branchRadius} A ${branchRadius} ${branchRadius} 0 0 0 ${trunk + branchRadius} ${y} H ${endX}`;
          };
          const reachPath = (childIndex: number) => {
            const y = rowCenters[childIndex] ?? fallbackCenters[childIndex];
            return `M ${trunk} 0 V ${y - branchRadius} A ${branchRadius} ${branchRadius} 0 0 0 ${trunk + branchRadius} ${y} H ${endX}`;
          };
          const reachLength = (childIndex: number) => {
            const y = rowCenters[childIndex] ?? fallbackCenters[childIndex];
            return y - branchRadius + (Math.PI * branchRadius) / 2 + (endX - trunk - branchRadius);
          };
          const lastY =
            rowCenters[rowCenters.length - 1] ?? fallbackCenters[fallbackCenters.length - 1] ?? 0;

          return (
            <li
              key={value}
              className={styles.section}
              data-open={isOpen ? "" : undefined}
              data-active={isActive ? "" : undefined}
            >
              <div className={styles.headerRow}>
                <a
                  ref={(element) => {
                    heads.current[index] = element;
                  }}
                  href={`#${value}`}
                  className={styles.head}
                  aria-current={isActive ? "location" : undefined}
                  data-active={isActive ? "" : undefined}
                  onClick={() => select(value, item)}
                >
                  <bdi dir="auto">{item.label}</bdi>
                </a>
                {hasChildren ? (
                  <button
                    type="button"
                    className={styles.toggle}
                    aria-label={`${isOpen ? "بستن" : "بازکردن"} زیرعنوان‌های ${item.label}`}
                    aria-expanded={isOpen}
                    aria-controls={bodyId}
                    onClick={() => toggle(index)}
                  >
                    <ChevronDown className={styles.toggleIcon} aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              {hasChildren ? (
                <div id={bodyId} className={styles.body} aria-hidden={!isOpen}>
                  <div className={styles.fold}>
                    <div
                      ref={(element) => {
                        trees.current[index] = element;
                      }}
                      className={styles.tree}
                    >
                      <svg
                        className={styles.lines}
                        width={indent}
                        height={treeHeight}
                        viewBox={`0 0 ${indent} ${treeHeight}`}
                        aria-hidden="true"
                      >
                        <path
                          className={styles.base}
                          d={`M ${trunk} 0 V ${lastY - branchRadius}`}
                        />
                        {children?.map((child, childIndex) => (
                          <path
                            key={child.value}
                            className={styles.base}
                            d={branchPath(childIndex)}
                          />
                        ))}
                        {children?.map((child, childIndex) => {
                          const length = reachLength(childIndex);
                          return (
                            <path
                              key={child.value}
                              className={styles.reach}
                              d={reachPath(childIndex)}
                              style={{
                                strokeDasharray: length,
                                strokeDashoffset: child.value === active ? 0 : length,
                              }}
                            />
                          );
                        })}
                      </svg>
                      <ol className={styles.children}>
                        {children?.map((child) => {
                          const isChildActive = child.value === active;
                          return (
                            <li key={child.value} className={styles.child}>
                              <a
                                href={`#${child.value}`}
                                className={styles.item}
                                aria-current={isChildActive ? "location" : undefined}
                                data-active={isChildActive ? "" : undefined}
                                data-branch-row=""
                                tabIndex={isOpen ? 0 : -1}
                                title={child.label}
                                onClick={() => select(child.value, child)}
                              >
                                {child.icon ? (
                                  <span className={styles.icon} aria-hidden="true">
                                    {renderIcon(child.icon)}
                                  </span>
                                ) : null}
                                <span className={styles.label} dir="auto">
                                  {child.label}
                                </span>
                              </a>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
