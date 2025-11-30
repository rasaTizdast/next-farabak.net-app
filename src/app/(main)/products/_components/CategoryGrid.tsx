import { Suspense } from "react";

import SkeletonLoader from "@/app/_components/ui/SkeletonLoader";

import CategoryCard from "./CategoryCard";

interface CategoryGridProps {
  type: "categories" | "subcategories";
  categorySlug?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = async ({ type, categorySlug }) => {
  async function fetchCategories() {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/getAll`;
      const res = await fetch(apiUrl, { next: { revalidate: 60 } });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      return data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  const allCategories = await fetchCategories();

  // Filter categories/subcategories based on type
  let categoriesToDisplay: any[] = [];

  if (type === "categories") {
    // Show all main categories
    categoriesToDisplay = allCategories.filter((cat: any) => cat.Available !== false);
  } else if (type === "subcategories" && categorySlug) {
    // Find the specific category and get its subcategories
    const category = allCategories.find((cat: any) => cat.Slug === categorySlug);
    if (category && category.Subcategories) {
      categoriesToDisplay = category.Subcategories.filter(
        (subcat: any) => subcat.Available !== false
      );
    }
  }

  // If no categories to display, return null
  if (categoriesToDisplay.length === 0) {
    return null;
  }

  return (
    <Suspense fallback={<SkeletonLoader amount={8} />}>
      <div className="w-full px-4 py-8 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {categoriesToDisplay.map((item: any) => (
            <CategoryCard
              key={item.CategoryID || item.CategoryContentId}
              name={item.Name}
              slug={item.Slug}
              banner={item.Banner}
              link={item.Link || `#`}
              type={type === "categories" ? "category" : "subcategory"}
            />
          ))}
        </div>
      </div>
    </Suspense>
  );
};

export default CategoryGrid;
