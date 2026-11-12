import type { HomepageTestimonial } from "@/content/homepage-proof";

const INTERNAL_HOSTS = new Set(["farabak.net", "www.farabak.net"]);
const SCHEME = /^[a-z][a-z\d+.-]*:/i;

function hasUnsafeCharacters(value: string): boolean {
  return (
    value.includes("\\") ||
    Array.from(value).some((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127;
    })
  );
}

function normalizeSafePath(value: string): string | null {
  let decoded = value;

  // Inspect encoded paths before URL() can silently collapse traversal segments.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (
      hasUnsafeCharacters(decoded) ||
      decoded.split("/").some((part) => part === "." || part === "..")
    ) {
      return null;
    }

    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) return value.replace(/\/{2,}/g, "/");
      decoded = next;
    } catch {
      return null;
    }
  }

  return null;
}

function splitPath(value: string): { path: string; suffix: string } {
  const suffixIndex = value.search(/[?#]/);
  return suffixIndex === -1
    ? { path: value, suffix: "" }
    : { path: value.slice(0, suffixIndex), suffix: value.slice(suffixIndex) };
}

function absoluteRawPath(value: string): string {
  return value.replace(/^https?:\/\/[^/?#]+/i, "").split(/[?#]/)[0] || "/";
}

function internalDestination(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || hasUnsafeCharacters(trimmed) || trimmed.startsWith("//")) return null;

  if (SCHEME.test(trimmed)) {
    if (!/^https?:\/\//i.test(trimmed)) return null;

    try {
      const url = new URL(trimmed);
      if (!INTERNAL_HOSTS.has(url.hostname) || url.username || url.password || url.port)
        return null;
      const path = normalizeSafePath(absoluteRawPath(trimmed));
      return path ? path + url.search + url.hash : null;
    } catch {
      return null;
    }
  }

  const { path, suffix } = splitPath(trimmed);
  const normalized = normalizeSafePath(path.startsWith("/") ? path : "/" + path);
  return normalized ? normalized + suffix : null;
}

export function publishedTestimonials(
  items: readonly HomepageTestimonial[]
): HomepageTestimonial[] {
  return items
    .filter(
      (item) =>
        item.approvedForPublication === true &&
        [item.quote, item.name, item.role, item.source].every((value) => value.trim().length > 0)
    )
    .map((item) => ({
      ...item,
      quote: item.quote.trim(),
      name: item.name.trim(),
      role: item.role.trim(),
      source: item.source.trim(),
    }));
}

export function normalizeInternalLink(value: string, fallback = "/products"): string {
  return internalDestination(value) ?? internalDestination(fallback) ?? "/products";
}

export function resolveHomepageImage(key: string, bucketUrl?: string): string | null {
  const value = key.trim();
  if (!value || hasUnsafeCharacters(value) || value.startsWith("//")) return null;

  if (value.startsWith("/")) {
    const { path, suffix } = splitPath(value);
    const normalized = normalizeSafePath(path);
    return normalized && normalized !== "/" ? normalized + suffix : null;
  }

  if (!bucketUrl || hasUnsafeCharacters(bucketUrl) || !/^https:\/\//i.test(bucketUrl)) return null;

  try {
    const bucket = new URL(bucketUrl);
    if (bucket.username || bucket.password || bucket.search || bucket.hash) return null;
    const bucketPath = normalizeSafePath(absoluteRawPath(bucketUrl));
    if (!bucketPath) return null;
    const prefix = bucketPath.replace(/\/$/, "");

    if (SCHEME.test(value)) {
      if (!/^https:\/\//i.test(value)) return null;
      const image = new URL(value);
      const path = normalizeSafePath(absoluteRawPath(value));
      if (
        image.origin !== bucket.origin ||
        image.username ||
        image.password ||
        !path ||
        !path.startsWith(prefix + "/") ||
        path === prefix + "/"
      )
        return null;
      return image.origin + path + image.search + image.hash;
    }

    const { path, suffix } = splitPath(value);
    const normalized = normalizeSafePath(path);
    if (!normalized) return null;
    return bucket.origin + prefix + "/" + normalized + suffix;
  } catch {
    return null;
  }
}
