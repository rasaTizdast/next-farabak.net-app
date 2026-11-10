const DEFAULT_SITE_URL = "https://farabak.net";
const DEFAULT_PRODUCT_BUCKET_URL = "https://farabaks3.storage.c2.liara.space";

function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  try {
    return new URL(value || fallback).toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export function getProductImageUrl(image: string | null | undefined): string {
  const siteUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL, DEFAULT_SITE_URL);
  const bucketUrl = normalizeBaseUrl(
    process.env.LIARA_BUCKET_URL || process.env.NEXT_PUBLIC_LIARA_BUCKET_URL,
    DEFAULT_PRODUCT_BUCKET_URL
  );
  const value = image?.trim();

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
