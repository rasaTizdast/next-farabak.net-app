import Link from "next/link";
import React from "react";

export function parseBlogTextToElements(text: string): React.ReactNode[] {
  const lines = text.split(/\r?\n/);
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
    const parts: React.ReactNode[] = [];
    const linkRegex = /\[([^\]]+)\]\(([^)\s]+)\)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(line)) !== null) {
      const start = match.index;
      if (start > lastIndex) parts.push(line.slice(lastIndex, start));
      const label = match[1];
      const href = match[2];
      parts.push(
        <Link
          key={`${key}-lnk-${start}`}
          href={href}
          className="text-blue-600 underline hover:text-blue-700"
        >
          {label}
        </Link>
      );
      lastIndex = start + match[0].length;
    }
    if (lastIndex < line.length) parts.push(line.slice(lastIndex));
    return <>{parts}</>;
  };

  lines.forEach((raw) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList(currentList);
      return;
    }

    const k = line.slice(0, 40).replace(/[^\w\u0600-\u06FF]/g, "");

    if (line.startsWith("### ")) {
      flushList(currentList);
      elements.push(<h3 key={`h3-${k}`}>{renderInline(line.slice(4), `h3-${k}`)}</h3>);
      return;
    }
    if (line.startsWith("## ")) {
      flushList(currentList);
      elements.push(<h2 key={`h2-${k}`}>{renderInline(line.slice(3), `h2-${k}`)}</h2>);
      return;
    }
    if (line.startsWith("# ")) {
      flushList(currentList);
      elements.push(<h1 key={`h1-${k}`}>{renderInline(line.slice(2), `h1-${k}`)}</h1>);
      return;
    }

    if (/^\d+\.\s+/.test(line)) {
      const content = line.replace(/^\d+\.\s+/, "");
      if (currentList.type && currentList.type !== "ol") flushList(currentList);
      currentList.type = "ol";
      currentList.items.push(<li key={`oli-${k}`}>{renderInline(content, `oli-${k}`)}</li>);
      return;
    }

    if (/^(\-|\*)\s+/.test(line)) {
      const content = line.replace(/^(\-|\*)\s+/, "");
      if (currentList.type && currentList.type !== "ul") flushList(currentList);
      currentList.type = "ul";
      currentList.items.push(<li key={`uli-${k}`}>{renderInline(content, `uli-${k}`)}</li>);
      return;
    }

    flushList(currentList);
    elements.push(<p key={`p-${k}`}>{renderInline(line, `p-${k}`)}</p>);
  });

  flushList(currentList);
  return elements;
}
