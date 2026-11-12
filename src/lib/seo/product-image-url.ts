const DEFAULT_SITE_URL = "https://farabak.net";
const DEFAULT_PRODUCT_BUCKET_URL = "https://farabaks3.storage.c2.liara.space";

// The 2110 catalog banner currently returns 404; its matching product thumbnail is available.
const KNOWN_MISSING_PRODUCT_IMAGE_KEYS = new Set([
  "blackmagic-2110-ip-converter-3x3g/blackmagic-2110-ip-converter-3x3g-banner.jpg",
]);

function getProductImageKey(value: string): string {
  let path = value;

  try {
    path = new URL(value).pathname;
  } catch {
    // Product image values are commonly bucket-relative paths.
  }

  const normalizedPath = path.split("/").filter(Boolean).join("/");
  const bucketPrefix = "productImages/";
  return normalizedPath.startsWith(bucketPrefix)
    ? normalizedPath.slice(bucketPrefix.length)
    : normalizedPath;
}

function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  try {
    return new URL(value || fallback).toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export function getProductImageUrl(
  image: string | null | undefined,
  fallbackImage?: string | null
): string {
  const siteUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL, DEFAULT_SITE_URL);
  const bucketUrl = normalizeBaseUrl(
    process.env.LIARA_BUCKET_URL || process.env.NEXT_PUBLIC_LIARA_BUCKET_URL,
    DEFAULT_PRODUCT_BUCKET_URL
  );
  let value = image?.trim();
  const fallbackValue = fallbackImage?.trim();

  if (value && fallbackValue && KNOWN_MISSING_PRODUCT_IMAGE_KEYS.has(getProductImageKey(value))) {
    value = fallbackValue;
  }

  if (!value) {
    return new URL("/Farabak_Logo.webp", siteUrl).toString();
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    if (value.startsWith("/productImages/")) {
      return new URL(
        value.slice("/productImages/".length),
        `${bucketUrl}/productImages/`
      ).toString();
    }

    return new URL(value, siteUrl).toString();
  }

  const path = value.replace(/^productImages\/+/, "");
  return new URL(path, `${bucketUrl}/productImages/`).toString();
}
