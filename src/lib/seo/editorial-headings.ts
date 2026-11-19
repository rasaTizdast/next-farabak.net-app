function getVisibleText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;|&#x0*a0;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeEditorialHeadings(content: string, pageTitle?: string): string {
  const normalizedPageTitle = pageTitle ? getVisibleText(pageTitle) : "";
  let duplicateTitleRemoved = false;

  return content.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, (_heading, attributes, inner) => {
    if (
      normalizedPageTitle &&
      !duplicateTitleRemoved &&
      getVisibleText(inner) === normalizedPageTitle
    ) {
      duplicateTitleRemoved = true;
      return "";
    }

    return `<h2${attributes}>${inner}</h2>`;
  });
}
