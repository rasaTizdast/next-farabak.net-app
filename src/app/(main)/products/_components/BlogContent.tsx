// Server component to render blog TEXT with Tailwind prose styles and schema.org
// Supports: headings (#, ##, ###), paragraphs, unordered/ordered lists, and links [text](url)
import Link from "next/link";
import React from "react";

import { parseBlogTextToElements } from "./parseBlogText";

interface BlogContentProps {
  html?: string; // legacy HTML input (will be wrapped)
  text?: string; // preferred text input
  as?: "h1" | "h2" | "none";
}

function _parseTextToElements(_text: string): React.ReactNode[] {
  const lines = _text.split(/\r?\n/);
  const elements: React.ReactNode[] = [];

  const flushList = (current: { type: "ul" | "ol" | null; items: React.ReactNode[] }) => {
    if (current.type && current.items.length) {
      const list =
        current.type === "ul" ? (
          <ul key={`ul-${elements.length}`}>{current.items}</ul>
        ) : (
          <ol key={`ol-${elements.length}`}>{current.items}</ol>
        );
      elements.push(list);
      current.type = null;
      current.items = [];
    }
  };

  const currentList = { type: null as "ul" | "ol" | null, items: [] as React.ReactNode[] };

  const renderInline = (line: string, key: string) => {
    // Replace markdown links [text](url) with Next.js Link
    const parts: React.ReactNode[] = [];
    const linkRegex = /\[([^\]]+)\]\(([^)\s]+)\)/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    while ((match = linkRegex.exec(line)) !== null) {
      const [full, label, href] = match;
      const start = match.index;
      if (start > lastIndex) parts.push(line.slice(lastIndex, start));
      parts.push(
        <Link
          key={`${key}-lnk-${start}`}
          href={href}
          className="mx-1 inline-block rounded-full border border-blue-800/40 bg-blue-900/30 px-3 py-1 text-blue-100 no-underline transition-all hover:bg-blue-900"
        >
          {label}
        </Link>
      );
      lastIndex = start + full.length;
    }
    if (lastIndex < line.length) parts.push(line.slice(lastIndex));
    return <>{parts}</>;
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList(currentList);
      return;
    }

    // Headings
    if (line.startsWith("### ")) {
      flushList(currentList);
      elements.push(<h3 key={`h3-${i}`}>{renderInline(line.slice(4), `h3-${i}`)}</h3>);
      return;
    }
    if (line.startsWith("## ")) {
      flushList(currentList);
      elements.push(<h2 key={`h2-${i}`}>{renderInline(line.slice(3), `h2-${i}`)}</h2>);
      return;
    }
    if (line.startsWith("# ")) {
      flushList(currentList);
      elements.push(<h1 key={`h1-${i}`}>{renderInline(line.slice(2), `h1-${i}`)}</h1>);
      return;
    }

    // Ordered list item e.g., "1. text"
    if (/^\d+\.\s+/.test(line)) {
      const content = line.replace(/^\d+\.\s+/, "");
      if (currentList.type && currentList.type !== "ol") flushList(currentList);
      currentList.type = "ol";
      currentList.items.push(<li key={`oli-${i}`}>{renderInline(content, `oli-${i}`)}</li>);
      return;
    }

    // Unordered list item e.g., "- text" or "* text"
    if (/^(\-|\*)\s+/.test(line)) {
      const content = line.replace(/^(\-|\*)\s+/, "");
      if (currentList.type && currentList.type !== "ul") flushList(currentList);
      currentList.type = "ul";
      currentList.items.push(<li key={`uli-${i}`}>{renderInline(content, `uli-${i}`)}</li>);
      return;
    }

    // Paragraph
    flushList(currentList);
    elements.push(<p key={`p-${i}`}>{renderInline(line, `p-${i}`)}</p>);
  });

  flushList(currentList);
  return elements;
}

// Wrapper component to handle table scrolling
const TableScrollWrapper = ({ htmlContent }: { htmlContent: string }) => {
  // Check if content contains tables
  const hasTables = /<table/i.test(htmlContent);

  if (!hasTables) {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  }

  // Wrap tables in scrollable divs with Tailwind classes
  const wrappedContent = htmlContent
    .replace(
      /<table([^>]*)>/gi,
      '<div class="my-6 overflow-x-auto -webkit-overflow-scrolling-touch rounded-lg border border-neutral-800"><table$1 class="w-full border-collapse">'
    )
    .replace(/<\/table>/gi, "</table></div>");

  return (
    <div
      className="[&_table]:m-0 [&_table_p]:m-0 [&_td]:whitespace-nowrap [&_td]:border [&_td]:border-neutral-800 [&_td]:bg-blue-900/30 [&_td]:!px-0 [&_td]:py-3 [&_td]:text-right [&_td]:text-neutral-300 [&_td_p]:px-2 [&_th]:whitespace-nowrap [&_th]:border [&_th]:border-neutral-800 [&_th]:bg-blue-900/60 [&_th]:px-2 [&_th]:py-3 [&_th]:text-right [&_th]:font-semibold [&_th]:text-neutral-100"
      dangerouslySetInnerHTML={{ __html: wrappedContent }}
    />
  );
};

const BlogContent = async ({ html, text }: BlogContentProps) => {
  if (!html && !text) return null;

  const content = (() => {
    if (typeof text === "string") {
      const looksLikeHtml = /<\w+[^>]*>/.test(text);
      if (looksLikeHtml) {
        return <TableScrollWrapper htmlContent={text} />;
      }
      return <div>{parseBlogTextToElements(text)}</div>;
    }
    return <TableScrollWrapper htmlContent={html as string} />;
  })();

  return (
    <section className="mx-auto mb-5 w-full rounded-xl border border-gray-900 bg-gray-800 p-3 shadow-sm backdrop-blur sm:p-5 md:p-7">
      <article
        dir="rtl"
        className="prose prose-neutral prose-invert max-w-none overflow-hidden break-words leading-relaxed [word-break:break-word] prose-headings:scroll-mt-24 prose-h1:text-2xl prose-h1:font-extrabold prose-h1:leading-tight prose-h2:mt-6 prose-h2:text-xl prose-h2:leading-tight prose-p:text-sm prose-p:leading-relaxed prose-a:inline-block prose-a:rounded-lg prose-a:border prose-a:border-blue-800/40 prose-a:bg-blue-900/30 prose-a:px-2 prose-a:py-1 prose-a:text-sm prose-a:text-blue-100 prose-a:no-underline prose-img:h-auto prose-img:max-w-full sm:prose-h1:text-3xl sm:prose-h2:mt-8 sm:prose-h2:text-2xl sm:prose-p:text-[15px] sm:prose-a:px-3 md:prose-p:text-base"
      >
        {content}
      </article>
    </section>
  );
};

export default BlogContent;
