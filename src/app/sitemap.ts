import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const response = await fetch("/api/sitemap/products");
  const { urls } = await response.json();
  const productEntries: MetadataRoute.Sitemap = urls.map((item: string) => ({
    url: `${item}`,
  }));
  return [...productEntries];
}
