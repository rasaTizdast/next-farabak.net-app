// menuHelpers.ts (Server-only) — shared category data for the products mega-menu and mobile drawer

import type { CategoryContent as PrismaCategoryContent } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

import { TAGS } from "@/lib/data/tags";
import { prisma } from "@/lib/prisma";

export interface MenuSubcategory {
  CategoryContentId: number;
  Name: string;
  CategoryID: number;
  Slug: string;
  Available: boolean;
  Link: string;
}

export interface MenuCategory {
  CategoryID: number;
  Name: string;
  Available: boolean;
  Slug: string;
  Link: string;
  Subcategories: MenuSubcategory[];
}

interface RawCategory {
  CategoryID: number;
  Name: string | null;
  Available: boolean | null;
  Slug: string | null;
  CategoryContent: (PrismaCategoryContent & { Available: boolean | null })[];
}

async function queryMenuCategories(): Promise<MenuCategory[]> {
  const categories = await prisma.category.findMany({
    orderBy: { CategoryID: "asc" },
    include: {
      CategoryContent: true,
    },
  });

  return categories
    .map((category: RawCategory): MenuCategory => ({
      CategoryID: category.CategoryID,
      Name: category.Name ?? "",
      Available: category.Available ?? false,
      Slug: category.Slug ?? "",
      Link: `/products/${category.Slug ?? ""}`,
      Subcategories: category.CategoryContent.map((sub) => ({
        CategoryContentId: sub.CategoryContentId,
        Name: sub.Name ?? "",
        CategoryID: sub.CategoryID ?? 0,
        Slug: sub.Slug ?? "",
        Available: sub.Available ?? false,
        Link: `/products/${category.Slug ?? ""}/${sub.Slug ?? ""}`,
      })),
    }))
    .filter((category) => category.Available);
}

// Cached menu categories for the Header mega-menu and mobile drawer. Wrapped in
// `use cache` (shared with the products/categories cache tag) so the layout's
// top-level read is prerendered instead of blocking the route.
export async function fetchMenuCategories(): Promise<MenuCategory[]> {
  "use cache";
  cacheTag(TAGS.categories);
  cacheLife("hours");

  try {
    return await queryMenuCategories();
  } catch (error) {
    // During build time or when DB is unavailable, return empty array so pages still build
    console.error("Error fetching menu categories:", error);
    return [];
  }
}
