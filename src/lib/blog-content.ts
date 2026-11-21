import DOMPurify from "isomorphic-dompurify";
import postcss from "postcss";

export const BLOG_HTML_MODE_MARKER = "<!--farabak:blog-editor=html-->";

const STYLE_BLOCK_PATTERN = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
const ALLOWED_CSS_AT_RULES = new Set(["media", "supports", "container"]);

function splitSelectorList(selector: string): string[] {
  const selectors: string[] = [];
  let start = 0;
  let parentheses = 0;
  let brackets = 0;
  let quote: "'" | '"' | null = null;
  let escaped = false;

  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === "\\") {
      escaped = true;
      continue;
    }

    if (quote) {
      if (character === quote) quote = null;
      continue;
    }

    if (character === "'" || character === '"') {
      quote = character;
    } else if (character === "(") {
      parentheses += 1;
    } else if (character === ")") {
      parentheses = Math.max(0, parentheses - 1);
    } else if (character === "[") {
      brackets += 1;
    } else if (character === "]") {
      brackets = Math.max(0, brackets - 1);
    } else if (character === "," && parentheses === 0 && brackets === 0) {
      selectors.push(selector.slice(start, index).trim());
      start = index + 1;
    }
  }

  selectors.push(selector.slice(start).trim());
  return selectors.filter(Boolean);
}

function scopeSelector(selector: string, scopeId: string): string | null {
  if (/(?:^|[^\\]):(?:global|host)(?:\b|\()/i.test(selector) || /::slotted\s*\(/i.test(selector)) {
    return null;
  }

  const rootSelector =
    /^(?:(?:html|body|:root)(?=\s|$|[>+~.#:[\]]))(?:\s+(?:(?:html|body|:root)(?=\s|$|[>+~.#:[\]])))*\s*/i;
  const rootMatch = selector.match(rootSelector);
  if (rootMatch) {
    const remainder = selector.slice(rootMatch[0].length).trim();
    return remainder ? `#${scopeId} ${remainder}` : `#${scopeId}`;
  }

  return `#${scopeId} :is(${selector})`;
}

function scopeCss(css: string, scopeId: string): string {
  if (!css.trim()) return "";

  try {
    const stylesheet = postcss.parse(css);

    stylesheet.walkAtRules((atRule) => {
      if (!ALLOWED_CSS_AT_RULES.has(atRule.name.toLowerCase())) atRule.remove();
    });

    stylesheet.walkDecls((declaration) => {
      if (
        /expression\s*\(|javascript\s*:|vbscript\s*:|url\s*\(\s*["']?\s*data:text\/html/i.test(
          declaration.value
        )
      ) {
        declaration.remove();
      }
    });

    stylesheet.walkRules((rule) => {
      const selectors = splitSelectorList(rule.selector)
        .map((selector) => scopeSelector(selector, scopeId))
        .filter((selector): selector is string => Boolean(selector));

      if (selectors.length === 0) {
        rule.remove();
        return;
      }

      rule.selector = selectors.join(", ");
    });

    const scopedCss = stylesheet.toString();
    return /<\/style/i.test(scopedCss) ? "" : scopedCss;
  } catch {
    // Invalid CSS is omitted instead of being emitted as global or malformed CSS.
    return "";
  }
}

export function createBlogContentScopeId(slug: string): string {
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `blog-content-${safeSlug || "article"}`;
}

export function extractScopedBlogStyles(
  html: string,
  scopeId: string
): { content: string; css: string } {
  const safeScopeId = /^[a-z][a-z0-9_-]*$/i.test(scopeId) ? scopeId : "blog-content-article";
  const styles: string[] = [];
  const content = html.replace(STYLE_BLOCK_PATTERN, (_styleBlock, css: string) => {
    const scopedCss = scopeCss(css, safeScopeId);
    if (scopedCss) styles.push(scopedCss);
    return "";
  });

  return { content, css: styles.join("\n") };
}

export function sanitizeBlogMarkup(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["Image", "video", "source"],
    ADD_ATTR: ["controls", "class", "id", "style"],
    FORBID_TAGS: ["style"],
  });
}

export function getBlogEditorMode(content: string): "visual" | "html" {
  return content.includes(BLOG_HTML_MODE_MARKER) || /<style\b|\sstyle\s*=/i.test(content)
    ? "html"
    : "visual";
}

export function stripBlogEditorModeMarker(content: string): string {
  return content.replaceAll(BLOG_HTML_MODE_MARKER, "");
}

export function markBlogContentAsHtml(content: string): string {
  return `${BLOG_HTML_MODE_MARKER}${stripBlogEditorModeMarker(content)}`;
}
