/**
 * Generate a URL-safe slug from a title string.
 * Returns empty string if input contains no Latin characters.
 */
export function generateSlug(title: string): string {
  if (!/[a-zA-Z0-9]/.test(title)) {
    return "";
  }

  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s\-_]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-+|-+$/g, "");
}
