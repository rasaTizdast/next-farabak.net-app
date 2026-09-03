"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { MdArrowBackIosNew } from "react-icons/md";

import type { MenuCategory, MenuSubcategory } from "@/helpers/menuHelpers";

interface ProductsMegaMenuContentProps {
  categoriesWithSubcategories: MenuCategory[];
  categoriesWithoutSubcategories: MenuCategory[];
}

interface MenuEntry {
  id: number;
  name: string;
  viewAllLink: string;
  items: { id: number; name: string; link: string }[];
}

const CLOSE_DELAY_MS = 150;

const ProductsMegaMenuContent = ({
  categoriesWithSubcategories,
  categoriesWithoutSubcategories,
}: ProductsMegaMenuContentProps) => {
  const [open, setOpen] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<number>(
    () => categoriesWithSubcategories[0]?.CategoryID ?? -1
  );
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLLIElement>(null);
  const panelId = useId();

  // Left column shows only category names; the detail pane reveals one category's subcategories at a time.
  const entries: MenuEntry[] = [
    ...categoriesWithSubcategories.map((category) => ({
      id: category.CategoryID,
      name: category.Name,
      viewAllLink: category.Link,
      items: category.Subcategories.filter((sub) => sub.Available).map((sub: MenuSubcategory) => ({
        id: sub.CategoryContentId,
        name: sub.Name,
        link: sub.Link,
      })),
    })),
    ...(categoriesWithoutSubcategories.length > 0
      ? [
          {
            id: -1,
            name: "دیگر محصولات",
            viewAllLink: "/products",
            items: categoriesWithoutSubcategories.map((category) => ({
              id: category.CategoryID,
              name: category.Name,
              link: category.Link,
            })),
          },
        ]
      : []),
  ];

  const activeEntry = entries.find((entry) => entry.id === activeEntryId) ?? entries[0];

  const cancelClose = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  };

  const openMenu = () => {
    cancelClose();
    setOpen(true);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimeout.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
      cancelClose();
    };
  }, []);

  return (
    <li ref={rootRef} className="relative">
      <Link
        href="/products"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(false)}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        onFocus={openMenu}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-t-lg px-8 py-3 text-[#ddd] transition-colors duration-300 hover:bg-white/10 ${
          open ? "text-primary bg-white/10" : ""
        }`}
      >
        محصولات
        <IoIosArrowDown
          className={`text-sm transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </Link>

      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          id={panelId}
          role="region"
          aria-label="دسته‌بندی محصولات"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className={`max-h-[80dvh] w-[94vw] max-w-[1050px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b172a]/95 shadow-[0_24px_48px_rgba(0,0,0,0.45)] backdrop-blur-md transition-[opacity,translate] duration-300 ${
            open
              ? "pointer-events-auto visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0"
          }`}
        >
          {!activeEntry ? (
            <div className="flex h-40 items-center justify-center px-8">
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="text-primary text-sm font-bold"
              >
                مشاهده همه محصولات
              </Link>
            </div>
          ) : (
            <div className="flex h-109 max-h-[70dvh]">
              {/* Master: category list */}
              <ul className="m-0 w-56 shrink-0 list-none overflow-y-auto border-s border-white/10 p-3 lg:w-64">
                {entries.map((entry) => {
                  const isActive = entry.id === activeEntry.id;
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveEntryId(entry.id)}
                        onClick={() => setActiveEntryId(entry.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-start text-[0.95rem] font-medium transition-colors duration-150 ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-[#f5f7fa] hover:bg-white/5"
                        }`}
                      >
                        <span>{entry.name}</span>
                        <MdArrowBackIosNew
                          className={`shrink-0 text-xs transition-colors duration-150 ${
                            isActive ? "text-primary" : "text-white/25"
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Detail: subcategories of the active category */}
              <div className="flex flex-1 flex-col overflow-hidden" key={activeEntry.id}>
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <h3 className="m-0 truncate text-base font-bold text-white">
                    {activeEntry.name}
                  </h3>
                  <Link
                    href={activeEntry.viewAllLink}
                    onClick={() => setOpen(false)}
                    className="text-primary hover:bg-primary/10 shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors duration-150"
                  >
                    مشاهده همه
                  </Link>
                </div>
                <ul className="m-0 grid list-none grid-cols-2 content-start gap-x-4 gap-y-1 overflow-y-auto p-5 xl:grid-cols-3">
                  {activeEntry.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.link}
                        onClick={() => setOpen(false)}
                        className="hover:text-primary block truncate rounded-lg px-3 py-2.5 text-[0.9rem] font-medium text-[#f5f7fa] transition-colors duration-150 hover:bg-white/5"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default ProductsMegaMenuContent;
