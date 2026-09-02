import { prisma } from "@/lib/prisma";

import { cachedQuery } from "./cache";
import { TAGS } from "./tags";

const staticRoutes: Record<string, string> = {
  "/": "صفحه اصلی",
  "/products": "محصولات",

  "/admin-panel": "پنل ادمین",
  "/dashboard": "داشبورد",

  "/about-us": "درباره ما",
  "/about-us/projects": "گالری تصاویر پروژه‌ها",
  "/about-us/members": "اعضای هیئت مدیره",

  "/support": "پشتیبانی",
  "/support/blog": "بلاگ",
};

// Replaces POST /api/breadcrumbs — resolves static + dynamic product paths to names.
async function queryBreadcrumbNames(paths: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  for (const path of paths) {
    if (path in staticRoutes) {
      results[path] = staticRoutes[path];
    }
  }

  const dynamicPaths = paths.filter((path) => !staticRoutes.hasOwnProperty(path));

  const dynamicResults = await Promise.all(
    dynamicPaths.map(async (path) => {
      const parts = path.split("/").filter(Boolean);
      if (parts.length === 2 && parts[0] === "products") {
        const slug = parts[1];
        const category = await prisma.category.findFirst({
          where: { Slug: slug, Available: true },
          select: { Name: true },
        });
        return { path, name: category?.Name || "نامشخص" };
      } else if (parts.length === 3 && parts[0] === "products") {
        const slug = parts[2];
        const subCategory = await prisma.categoryContent.findFirst({
          where: { Slug: slug, Available: true },
          select: { Name: true },
        });
        return { path, name: subCategory?.Name || "نامشخص" };
      }
      return { path, name: "نامشخص" };
    })
  );

  for (const { path, name } of dynamicResults) {
    results[path] = name;
  }

  return results;
}

export const getBreadcrumbNames = cachedQuery("getBreadcrumbNames", queryBreadcrumbNames, {
  revalidate: 60,
  tags: [TAGS.breadcrumbs, TAGS.categories],
});
