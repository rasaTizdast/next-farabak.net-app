"use client";

import { useState } from "react";

interface AccordionItem<T> {
  id: string;
  data: T;
  renderHeader: (item: T) => React.ReactNode;
  renderContent: (item: T) => React.ReactNode;
}

interface AccordionProps<T> {
  items: AccordionItem<T>[];
  allowMultiple?: boolean;
}

export function Accordion<T>({ items, allowMultiple = false }: AccordionProps<T>) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const buttonId = `faq-question-${item.id}`;
        const panelId = `faq-answer-${item.id}`;
        return (
          <div key={item.id} className="bg-white">
            <button
              id={buttonId}
              type="button"
              aria-controls={panelId}
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
              className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-right transition-colors hover:bg-slate-50 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none focus-visible:ring-inset"
            >
              {item.renderHeader(item.data)}
              <span
                aria-hidden="true"
                className={`shrink-0 text-(--farabak-action-blue) transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                ↓
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="border-t border-slate-100 p-4 text-(--farabak-ink-muted)"
            >
              {item.renderContent(item.data)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
