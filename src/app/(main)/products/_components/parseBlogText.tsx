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

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList(currentList);
      return;
    }

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

    if (/^\d+\.\s+/.test(line)) {
      const content = line.replace(/^\d+\.\s+/, "");
      if (currentList.type && currentList.type !== "ol") flushList(currentList);
      currentList.type = "ol";
      currentList.items.push(<li key={`oli-${i}`}>{renderInline(content, `oli-${i}`)}</li>);
      return;
    }

    if (/^(\-|\*)\s+/.test(line)) {
      const content = line.replace(/^(\-|\*)\s+/, "");
      if (currentList.type && currentList.type !== "ul") flushList(currentList);
      currentList.type = "ul";
      currentList.items.push(<li key={`uli-${i}`}>{renderInline(content, `uli-${i}`)}</li>);
      return;
    }

    flushList(currentList);
    elements.push(<p key={`p-${i}`}>{renderInline(line, `p-${i}`)}</p>);
  });

  flushList(currentList);
  return elements;
}
