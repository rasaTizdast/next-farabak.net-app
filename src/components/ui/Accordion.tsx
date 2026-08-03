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
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-right hover:bg-gray-50"
            >
              {item.renderHeader(item.data)}
              <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            {isOpen && <div className="border-t border-gray-100 px-4 py-3">{item.renderContent(item.data)}</div>}
          </div>
        );
      })}
    </div>
  );
}
