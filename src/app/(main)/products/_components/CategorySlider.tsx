import { Suspense } from "react";

import { getAllCategories } from "@/lib/data/categories";

import CategorySliderContent from "./CategorySliderContent";
import { CategorySliderSkeleton } from "./ProductListSkeletons";

interface CategorySliderItem {
  Name: string;
  Slug: string;
  Banner?: string;
  Link?: string;
}

interface CategorySliderProps {
  type: "categories" | "subcategories";
  categorySlug?: string;
}

async function fetchCategoriesData(
  type: "categories" | "subcategories",
  categorySlug?: string
): Promise<CategorySliderItem[]> {
  try {
    const allCategories = await getAllCategories();

    // Filter categories/subcategories based on type
    if (type === "categories") {
      return allCategories
        .filter((cat) => cat.Available !== false)
        .map((cat) => ({
          Name: cat.Name || "",
          Slug: cat.Slug || "",
          Banner: cat.Banner ?? undefined,
          Link: cat.Link,
        }));
    } else if (type === "subcategories" && categorySlug) {
      const category = allCategories.find((cat) => cat.Slug === categorySlug);
      if (category && category.Subcategories) {
        return category.Subcategories.filter((subcat) => subcat.Available !== false).map(
          (subcat) => ({
            Name: subcat.Name || "",
            Slug: subcat.Slug || "",
            Banner: subcat.Banner ?? undefined,
            Link: subcat.Link,
          })
        );
      }
    }

    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function CategorySlider({ type, categorySlug }: CategorySliderProps) {
  const items = await fetchCategoriesData(type, categorySlug);

  if (items.length === 0) {
    return null;
  }

  return (
    <Suspense fallback={<CategorySliderSkeleton subcategories={type === "subcategories"} />}>
      <CategorySliderContent
        items={items}
        type={type === "subcategories" ? "subcategory" : "category"}
      />
    </Suspense>
  );
}
