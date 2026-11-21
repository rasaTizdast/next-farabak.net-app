import { BRAND_LABELS, detectBrand } from "@/helpers/sources";

// These catalog categories identify a brand, unlike generic families such as X-ray.
const CATEGORY_BRANDS: Readonly<Record<string, string>> = {
  "reolink-cctv-camera": "Reolink",
  blackmagic: "Blackmagic Design",
};

export function getProductBrand(categorySlug: string | null | undefined, model?: string | null) {
  const categoryBrand = CATEGORY_BRANDS[categorySlug ?? ""];
  if (typeof categoryBrand === "string") return categoryBrand;
  const token = detectBrand(model);
  return token ? BRAND_LABELS[token] : null;
}
