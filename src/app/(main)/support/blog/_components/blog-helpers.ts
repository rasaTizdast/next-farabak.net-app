export type ArticleHeading = {
  id: string;
  level: 2 | 3;
  text: string;
};

function stripTags(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function extractArticleHeadings(content: string): ArticleHeading[] {
  const headings: ArticleHeading[] = [];
  const headingPattern = /<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(content)) !== null) {
    const level = Number(match[1]) as 2 | 3;
    const existingId = match[2].match(/\sid=["']([^"']+)["']/i)?.[1];
    const text = stripTags(match[3]);

    if (text) {
      headings.push({
        id: existingId ?? `section-${headings.length + 1}`,
        level,
        text,
      });
    }
  }

  return headings;
}

export function addArticleHeadingAnchors(content: string): string {
  let headingIndex = 0;

  return content.replace(/<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, text) => {
    if (/\sid=["']/i.test(attrs)) return match;
    headingIndex += 1;
    return `<h${level}${attrs} id="section-${headingIndex}">${text}</h${level}>`;
  });
}

export function countWords(content: string): number {
  const cleanText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9\s]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleanText.split(/\s+/).filter((word) => word.length > 0).length;
}

export function calculateReadingTime(content: string): number {
  return Math.max(1, Math.ceil(countWords(content) / 250));
}
