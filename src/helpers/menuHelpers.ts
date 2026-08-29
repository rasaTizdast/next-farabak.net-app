// menuHelpers.ts (Server-only) — shared category data for the products mega-menu and mobile drawer

import type { CategoryContent as PrismaCategoryContent } from "@prisma/client";
import { cache } from "react";

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

// Fetch categories directly from the database to avoid network calls during SSG/ISR.
// Wrapped in React cache() so Header, the mega-menu and any other consumer share one query per request.
export const fetchMenuCategories = cache(async (): Promise<MenuCategory[]> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { CategoryID: "asc" },
      include: {
        CategoryContent: true,
      },
    });

    return categories
      .map((category: RawCategory) => ({
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
  } catch (error) {
    // During build time or when DB is unavailable, return empty array so pages still build
    console.error("Error fetching menu categories:", error);
    return [];
  }
});
