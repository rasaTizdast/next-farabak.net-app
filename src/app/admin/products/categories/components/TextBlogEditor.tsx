"use client";

import { useMemo, useRef, useState } from "react";

import { parseBlogTextToElements } from "@/app/(main)/products/_components/parseBlogText";

interface TextBlogEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function insertAtCursor(textarea: HTMLTextAreaElement, before: string, after: string = "") {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const selected = textarea.value.slice(start, end);
  const beforeText = textarea.value.slice(0, start);
  const afterText = textarea.value.slice(end);
  const newValue = `${beforeText}${before}${selected}${after}${afterText}`;
  const newCursor = start + before.length + selected.length + after.length;
  return { newValue, newCursor };
}

function transformSelectedLines(
  textarea: HTMLTextAreaElement,
  transformer: (line: string, idx: number) => string
) {
  const value = textarea.value;
  const start = textarea.selectionStart ?? 0;
  const end = textarea.selectionEnd ?? value.length;
  const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const lineEnd = (() => {
    const idx = value.indexOf("\n", end);
    return idx === -1 ? value.length : idx;
  })();
  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const updated = lines.map(transformer).join("\n");
  const newValue = value.slice(0, lineStart) + updated + value.slice(lineEnd);
  return { newValue };
}

const TextBlogEditor: React.FC<TextBlogEditorProps> = ({ label, value, onChange, placeholder }) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [preview, setPreview] = useState(false);
  const previewNodes = useMemo(() => parseBlogTextToElements(value || ""), [value]);

  const apply = (type: "h1" | "h2" | "h3" | "ul" | "ol" | "link") => {
    const el = ref.current;
    if (!el) return;

    if (type === "link") {
      const url = prompt("آدرس لینک را وارد کنید:", "https://");
      const label = prompt("متن لینک را وارد کنید:", "لینک");
      const { newValue, newCursor } = insertAtCursor(
        el,
        `[${label || "لینک"}](${url || "https://example.com"})`
      );
      onChange(newValue);
      requestAnimationFrame(() => {
        el.focus();
        el.selectionStart = el.selectionEnd = newCursor;
      });
      return;
    }

    const prefix =
      type === "h1"
        ? "# "
        : type === "h2"
          ? "## "
          : type === "h3"
            ? "### "
            : type === "ul"
              ? "- "
              : "1. ";
    const { newValue } = transformSelectedLines(el, (line) => {
      const trimmed = line.trimStart();
      if (
        (type === "h1" && /^#\s+/.test(trimmed)) ||
        (type === "h2" && /^##\s+/.test(trimmed)) ||
        (type === "h3" && /^###\s+/.test(trimmed))
      ) {
        return line.replace(/^(\s*)#{1,3}\s+/, "$1");
      }
      if (type === "ul" && /^(-|\*)\s+/.test(trimmed)) {
        return line.replace(/^(\s*)(-|\*)\s+/, "$1");
      }
      if (type === "ol" && /^\d+\.\s+/.test(trimmed)) {
        return line.replace(/^(\s*)\d+\.\s+/, "$1");
      }
      return (line.match(/^\s*/)?.[0] || "") + prefix + trimmed;
    });
    onChange(newValue);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = ref.current;
    if (!el) return;

    if (e.ctrlKey || e.metaKey) {
      if (e.key === "1") {
        e.preventDefault();
        apply("h1");
        return;
      }
      if (e.key === "2") {
        e.preventDefault();
        apply("h2");
        return;
      }
      if (e.key === "3") {
        e.preventDefault();
        apply("h3");
        return;
      }
      if (e.key.toLowerCase() === "l") {
        e.preventDefault();
        apply("link");
        return;
      }
    }

    if (e.key === "Enter") {
      const start = el.selectionStart ?? 0;
      const value = el.value;
      const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const currentLine = value.slice(lineStart, start);
      const ulMatch = currentLine.match(/^(\s*)(-|\*)\s+/);
      const olMatch = currentLine.match(/^(\s*)(\d+)\.\s+/);
      if (ulMatch || olMatch) {
        e.preventDefault();
        const indent = (ulMatch || olMatch)![1];
        if (currentLine.trim().match(/^(-|\*|\d+\.)\s*$/)) {
          const insert = "\n";
          const { newValue, newCursor } = insertAtCursor(el, insert);
          onChange(newValue);
          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = newCursor;
          });
          return;
        }
        let marker = "- ";
        if (olMatch) {
          const n = parseInt(olMatch[2], 10) + 1;
          marker = `${n}. `;
        }
        const insert = `\n${indent}${marker}`;
        const { newValue, newCursor } = insertAtCursor(el, insert);
        onChange(newValue);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = newCursor;
        });
      }
    }

    if (e.key === "Backspace") {
      const start = el.selectionStart ?? 0;
      if (start > 0) {
        const value = el.value;
        const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
        const uptoCursor = value.slice(lineStart, start);
        if (/^(\s*)(-|\*|\d+\.)\s?$/.test(uptoCursor)) {
          e.preventDefault();
          const newValue = value.slice(0, lineStart) + value.slice(start);
          onChange(newValue);
          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = lineStart;
          });
        }
      }
    }
  };

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm">{label}</label>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => apply("h1")}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          عنوان (H1)
        </button>
        <button
          type="button"
          onClick={() => apply("h2")}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          تیتر (H2)
        </button>
        <button
          type="button"
          onClick={() => apply("h3")}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          سرفصل (H3)
        </button>
        <button
          type="button"
          onClick={() => apply("ul")}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          • لیست
        </button>
        <button
          type="button"
          onClick={() => apply("ol")}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          1. شماره دار
        </button>
        <button
          type="button"
          onClick={() => apply("link")}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          لینک
        </button>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="rounded bg-indigo-600 px-2 py-1 text-sm hover:bg-indigo-500"
        >
          {preview ? "Edit" : "Preview"}
        </button>
        <span className="ml-auto text-xs text-gray-300">
          میانبرها: Ctrl+1/2/3 برای تیترها، Ctrl+L برای لینک
        </span>
      </div>
      {preview ? (
        <div className="prose prose-neutral max-w-none rounded-lg border border-gray-700 bg-gray-800 p-3 dark:prose-invert">
          {previewNodes}
        </div>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full rounded-lg border border-gray-900 bg-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={6}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

export default TextBlogEditor;
