"use client";

import { useEffect, useRef, useState } from "react";

import { BlogHtmlEditor } from "@/components/blog/BlogHtmlEditor";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import {
  getBlogEditorMode,
  markBlogContentAsHtml,
  stripBlogEditorModeMarker,
} from "@/lib/blog-content";

interface ProductBlogEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export function ProductBlogEditor({ value, onChange }: ProductBlogEditorProps) {
  const [editorContent, setEditorContent] = useState(() => stripBlogEditorModeMarker(value));
  const [editorMode, setEditorMode] = useState<"visual" | "html">(() => getBlogEditorMode(value));
  const [showVisualConversionWarning, setShowVisualConversionWarning] = useState(false);
  const lastEmittedValueRef = useRef(value);

  useEffect(() => {
    if (value === lastEmittedValueRef.current) return;

    lastEmittedValueRef.current = value;
    setEditorContent(stripBlogEditorModeMarker(value));
    setEditorMode(getBlogEditorMode(value));
    setShowVisualConversionWarning(false);
  }, [value]);

  const persistContent = (content: string, mode: "visual" | "html") => {
    setEditorContent(content);
    const persistedContent = mode === "html" ? markBlogContentAsHtml(content) : content;
    lastEmittedValueRef.current = persistedContent;
    onChange(persistedContent);
  };

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="حالت ویرایش محتوای مقاله محصول" className="flex gap-1">
          <button
            type="button"
            aria-pressed={editorMode === "visual"}
            onClick={() => {
              if (editorMode === "html") setShowVisualConversionWarning(true);
            }}
            className={`rounded-lg px-3 py-2 transition-colors ${
              editorMode === "visual"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            ویرایشگر دیداری
          </button>
          <button
            type="button"
            aria-pressed={editorMode === "html"}
            onClick={() => {
              setShowVisualConversionWarning(false);
              setEditorMode("html");
              persistContent(editorContent, "html");
            }}
            className={`rounded-lg px-3 py-2 transition-colors ${
              editorMode === "html"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            ویرایش HTML
          </button>
        </div>
      </div>

      {showVisualConversionWarning ? (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-950/40 p-4 text-amber-100"
        >
          <p>
            تبدیل به ویرایشگر دیداری ممکن است ساختار یا استایل‌های HTML پشتیبانی‌نشده را تغییر دهد.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEditorMode("visual");
                setShowVisualConversionWarning(false);
                persistContent(editorContent, "visual");
              }}
              className="rounded-lg bg-amber-500 px-3 py-2 text-gray-950 hover:bg-amber-400"
            >
              تبدیل به ویرایشگر دیداری
            </button>
            <button
              type="button"
              onClick={() => setShowVisualConversionWarning(false)}
              className="rounded-lg bg-gray-700 px-3 py-2 text-gray-100 hover:bg-gray-600"
            >
              ادامه با کد HTML
            </button>
          </div>
        </div>
      ) : null}

      {editorMode === "html" ? (
        <BlogHtmlEditor
          value={editorContent}
          onChange={(content) => persistContent(content, "html")}
        />
      ) : (
        <TipTapEditor
          content={editorContent}
          onChange={(content) => persistContent(content, "visual")}
          placeholder="محتوا را وارد کنید..."
        />
      )}
    </div>
  );
}
