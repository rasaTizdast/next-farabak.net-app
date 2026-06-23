"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

export function ButtonBase(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    variant?: "primary" | "danger" | "default";
  }
) {
  const { className = "", loading, variant = "default", disabled, children, ...rest } = props;
  const base =
    variant === "primary"
      ? "bg-blue-600 hover:bg-blue-700"
      : variant === "danger"
        ? "bg-red-600 hover:bg-red-700"
        : "bg-slate-700 hover:bg-slate-600";
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      className={`rounded px-3 py-1.5 text-sm text-white transition-colors disabled:opacity-60 ${base} ${className}`}
    >
      {loading ? <span className="inline-block animate-pulse">...</span> : children}
    </button>
  );
}

export function InputBase(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none transition-colors hover:bg-slate-700 focus:bg-slate-700 ${className}`}
    />
  );
}

export function ModalBase({
  open,
  onClose,
  title,
  children,
  footer,
  width = 600,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1000] m-0 flex items-center justify-center p-0">
      <div className="absolute inset-0 m-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative max-h-[90vh] w-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-4 text-white shadow-xl"
        style={{ width }}
      >
        {title ? <div className="mb-3 text-lg font-semibold">{title}</div> : null}
        <div>{children}</div>
        {footer ? <div className="mt-4 flex items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}

// Prevent layout shift when opening modals by locking body scroll and compensating scrollbar
export function useBodyScrollLock(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isActive]);
}

export function TableBase<T>({
  columns,
  data,
  rowKey,
  loading,
  pagination,
}: {
  columns: Array<{
    title: React.ReactNode;
    key: string;
    dataIndex?: keyof T;
    render?: (value: any, record: T) => React.ReactNode;
  }>;
  data: T[];
  rowKey: (r: T) => string | number;
  loading?: boolean;
  pagination?:
    | {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize: number) => void;
      }
    | false;
}) {
  const totalPages =
    pagination && pagination.pageSize > 0
      ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
      : 1;
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-right">
        <thead className="bg-slate-900">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-200"
              >
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900/40">
          {loading ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-300" colSpan={columns.length}>
                در حال بارگذاری...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-300" colSpan={columns.length}>
                آیتمی یافت نشد
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-slate-800/40">
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-4 py-3 text-sm text-slate-100">
                    {c.render
                      ? c.render(c.dataIndex ? (row as any)[c.dataIndex] : undefined, row)
                      : c.dataIndex
                        ? (row as any)[c.dataIndex]
                        : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {pagination !== false && pagination ? (
        <div className="mt-4 flex items-center justify-start gap-2">
          <ButtonBase
            onClick={() =>
              pagination.onChange(Math.max(1, pagination.current - 1), pagination.pageSize)
            }
            disabled={pagination.current <= 1}
          >
            قبلی
          </ButtonBase>
          <span className="rounded bg-slate-800 px-2 py-1 text-sm text-white">
            {pagination.current}
          </span>
          <span className="text-sm text-slate-400">از {totalPages}</span>
          <ButtonBase
            onClick={() =>
              pagination.onChange(Math.min(totalPages, pagination.current + 1), pagination.pageSize)
            }
            disabled={pagination.current >= totalPages}
          >
            بعدی
          </ButtonBase>
        </div>
      ) : null}
    </div>
  );
}

export function AutoCompleteBase({
  value,
  onChange,
  placeholder,
  options,
  onSelect,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  options: Array<{ value: string; label?: React.ReactNode; [k: string]: any }>;
  onSelect?: (value: string, option: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const filtered = options.filter((o) =>
    (o.value || "")
      .toString()
      .toLowerCase()
      .includes((value || "").toLowerCase())
  );
  const updatePosition = () => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const preferredWidth = Math.min(rect.width, 480);
    // Align dropdown start with input start; if smaller than input, keep left edge same
    const left = rect.left + window.scrollX + Math.max(0, rect.width - preferredWidth);
    setCoords({
      top: rect.bottom + window.scrollY + 4,
      left,
      width: preferredWidth,
    });
  };
  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);
  return (
    <div className="relative">
      <input
        ref={inputRef}
        className={`w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none transition-colors hover:bg-slate-700 focus:bg-slate-700`}
        value={value}
        onChange={(e) => {
          onChange((e.target as HTMLInputElement).value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
          updatePosition();
        }}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            const chosen = filtered[activeIndex];
            if (chosen) {
              onChange(chosen.value);
              onSelect?.(chosen.value, chosen);
              setOpen(false);
            }
          } else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
          }
        }}
        onBlur={() =>
          setTimeout(() => {
            setFocused(false);
            setOpen(false);
          }, 150)
        }
        placeholder={placeholder}
      />
      {open && focused && filtered.length > 0 && coords
        ? ReactDOM.createPortal(
            <div
              className="z-[1100] max-h-[30vh] w-full overflow-auto rounded-md border border-slate-700 bg-slate-900/95 text-sm shadow-2xl backdrop-blur"
              style={{
                position: "absolute",
                top: coords.top,
                left: coords.left,
                width: coords.width,
              }}
            >
              <div className="sticky top-0 z-10 border-b border-slate-700 bg-slate-900/95 px-3 py-2 text-xs text-slate-400">
                نتایج: {filtered.length}
              </div>
              {filtered.map((o, idx) => {
                const label = typeof o.label === "string" ? o.label : (o.value as string);
                const query = (value || "").toLowerCase();
                const lower = (label || "").toLowerCase();
                const start = lower.indexOf(query);
                const end = start + query.length;
                return (
                  <div
                    key={`${o.value}-${idx}`}
                    className={`cursor-pointer px-3 py-2 text-slate-100 hover:bg-slate-800 ${idx === activeIndex ? "bg-slate-800" : ""}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      onChange(o.value);
                      onSelect?.(o.value, o);
                      setOpen(false);
                    }}
                  >
                    {start >= 0 ? (
                      <span>
                        {label.slice(0, start)}
                        <span className="text-emerald-400">{label.slice(start, end)}</span>
                        {label.slice(end)}
                      </span>
                    ) : (
                      <span>{o.label ?? o.value}</span>
                    )}
                  </div>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
