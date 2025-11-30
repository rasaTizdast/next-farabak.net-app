import { Suspense } from "react";

import SkeletonLoader from "@/app/_components/ui/SkeletonLoader";

import CategorySliderContent from "./CategorySliderContent";

interface CategorySliderProps {
  type: "categories" | "subcategories";
  categorySlug?: string;
}

async function fetchCategoriesData(type: "categories" | "subcategories", categorySlug?: string) {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/getAll`;
    const res = await fetch(apiUrl, { next: { revalidate: 60 } });

    if (!res.ok) {
      return [];
    }

    const allCategories = await res.json();

    // Filter categories/subcategories based on type
    if (type === "categories") {
      return allCategories.filter((cat: any) => cat.Available !== false);
    } else if (type === "subcategories" && categorySlug) {
      const category = allCategories.find((cat: any) => cat.Slug === categorySlug);
      if (category && category.Subcategories) {
        return category.Subcategories.filter((subcat: any) => subcat.Available !== false);
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
    <Suspense fallback={<SkeletonLoader amount={8} />}>
      <CategorySliderContent items={items} />
    </Suspense>
  );
}
