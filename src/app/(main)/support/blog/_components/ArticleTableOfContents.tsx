"use client";

import { useEffect, useMemo, useState } from "react";

import type { ArticleHeading } from "./blog-helpers";
import BranchedMenu, { type BranchedMenuItem } from "./BranchedMenu";

type ArticleTableOfContentsProps = {
  headings: ArticleHeading[];
  title?: string;
  className?: string;
};

function groupHeadings(headings: ArticleHeading[]): BranchedMenuItem[] {
  const items: BranchedMenuItem[] = [];

  for (const heading of headings) {
    if (heading.level === 2) {
      items.push({ value: heading.id, label: heading.text, children: [] });
      continue;
    }

    const parent = items.at(-1);
    if (parent?.children) {
      parent.children.push({ value: heading.id, label: heading.text });
    } else {
      items.push({ value: heading.id, label: heading.text });
    }
  }

  return items.map((item) =>
    item.children?.length ? item : { value: item.value, label: item.label }
  );
}

export default function ArticleTableOfContents({
  headings,
  title = "در این مقاله",
  className = "",
}: ArticleTableOfContentsProps) {
  const items = useMemo(() => groupHeadings(headings), [headings]);
  const headingIds = useMemo(() => headings.map((heading) => heading.id), [headings]);
  const headingKey = headingIds.join("|");
  const [activeValue, setActiveValue] = useState(headingIds[0] ?? "");
  const openSections = useMemo(() => {
    const firstNestedSection = items.findIndex((item) => item.children?.length);
    return firstNestedSection < 0 ? [] : [firstNestedSection];
  }, [items]);

  useEffect(() => {
    const targets = headingIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element instanceof HTMLElement);

    if (!targets.length) return;

    const syncActiveHeading = () => {
      const activationLine = window.innerHeight * 0.32;
      let current = targets[0];

      for (const target of targets) {
        if (target.getBoundingClientRect().top <= activationLine) current = target;
        else break;
      }

      setActiveValue((previous) => (previous === current.id ? previous : current.id));
    };

    if (typeof IntersectionObserver === "undefined") {
      let frame: number | undefined;
      const updateOnScroll = () => {
        if (frame !== undefined) return;
        frame = window.requestAnimationFrame(() => {
          frame = undefined;
          syncActiveHeading();
        });
      };

      window.addEventListener("scroll", updateOnScroll, { passive: true });
      window.addEventListener("resize", updateOnScroll);
      syncActiveHeading();
      return () => {
        window.removeEventListener("scroll", updateOnScroll);
        window.removeEventListener("resize", updateOnScroll);
        if (frame !== undefined) window.cancelAnimationFrame(frame);
      };
    }

    const observer = new IntersectionObserver(syncActiveHeading, {
      rootMargin: "-8% 0px -68% 0px",
      threshold: 0,
    });

    targets.forEach((target) => observer.observe(target));
    syncActiveHeading();
    return () => observer.disconnect();
  }, [headingKey, headingIds]);

  return (
    <div className={className}>
      <p className="mb-3 text-sm font-bold text-(--farabak-ink-deep)">{title}</p>
      <BranchedMenu
        items={items}
        ariaLabel="فهرست مقاله"
        defaultOpen={openSections}
        defaultActive={headingIds[0] ?? ""}
        activeValue={activeValue}
        onSelect={setActiveValue}
        color="#061a30"
        accentColor="#1265e8"
        lineColor="#cbd5e1"
        width={340}
        rowHeight={42}
        indent={38}
        trunk={14}
        radius={10}
        lineWidth={1.5}
        fontSize={14}
        drawDuration={360}
        foldDuration={260}
      />
    </div>
  );
}
