"use client";

import { useMemo } from "react";

import { BlogArticleContent } from "@/components/public/BlogArticleContent";
import { extractScopedBlogStyles } from "@/lib/blog-content";

interface BlogHtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const PREVIEW_SCOPE_ID = "blog-html-preview";

export function BlogHtmlEditor({ value, onChange }: BlogHtmlEditorProps) {
  const preview = useMemo(() => {
    return extractScopedBlogStyles(value, PREVIEW_SCOPE_ID);
  }, [value]);

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-2" dir="rtl">
      <div className="min-w-0">
        <label htmlFor="blog-html-source" className="mb-2 block font-semibold text-gray-200">
          کد HTML وبلاگ
        </label>
        <textarea
          id="blog-html-source"
          aria-label="کد HTML وبلاگ"
          dir="ltr"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-96 w-full resize-y rounded-lg border border-gray-600 bg-gray-950 p-4 font-mono text-sm leading-6 text-gray-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
        />
        <p className="mt-2 text-sm leading-6 text-gray-400">
          کد و استایل‌ها فقط در همین مقاله اعمال می‌شوند. اسکریپت‌ها و رویدادهای اجرایی حذف می‌شوند.
        </p>
      </div>

      <section aria-label="پیش‌نمایش محتوای HTML" className="min-w-0">
        <h3 className="mb-2 font-semibold text-gray-200">پیش‌نمایش</h3>
        <div className="min-h-96 overflow-auto rounded-lg border border-gray-600 bg-white">
          <BlogArticleContent
            html={preview.content}
            css={preview.css}
            scopeId={PREVIEW_SCOPE_ID}
            className="prose-view mx-auto min-h-96 max-w-none p-4"
          />
        </div>
      </section>
    </div>
  );
}
