// ProductsMegaMenu.tsx (Server Component)

import Link from "next/link";

import { prisma } from "@/lib/prisma";

import styles from "./ProductsMegaMenu.module.css";

export const dynamic = "force-dynamic";

// Category and Subcategory types
export interface Subcategory {
  CategoryContentId: number;
  Name: string;
  CategoryID: number;
  Slug: string;
  Available: boolean;
  Link: string;
  SEO_Details: {
    SEO_Title: string;
    SEO_Description: string;
    SEO_Keywords: string[];
  };
}

export interface Category {
  CategoryID: number;
  Name: string;
  Available: boolean;
  Slug: string;
  Link: string;
  Subcategories: Subcategory[];
  SEO_Details: {
    SEO_Title: string;
    SEO_Description: string;
    SEO_Keywords: string[];
  };
}

// Fetch categories directly from the database to avoid network calls during SSG/ISR
async function fetchCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { CategoryID: "asc" },
      include: {
        SEO_Category: true,
        CategoryContent: {
          include: {
            SEO_CategoryContent: true,
          },
        },
      },
    });

    const categoriesWithSubcategoriesAndSEO = categories.map((category: any) => {
      const subcategoriesWithSEO = category.CategoryContent.map((sub: any) => {
        return {
          ...sub,
          Link: `/products/${category.Slug}/${sub.Slug}`,
          SEO_Details: sub.SEO_CategoryContent || {
            SEO_Title: null,
            SEO_Description: null,
            SEO_Keywords: null,
          },
        };
      });

      return {
        ...category,
        Link: `/products/${category.Slug}`,
        SEO_Details: category.SEO_Category || {
          SEO_Title: null,
          SEO_Description: null,
          SEO_Keywords: null,
        },
        Subcategories: subcategoriesWithSEO,
      };
    });

    // Filter only available categories
    return categoriesWithSubcategoriesAndSEO.filter((category: any) => category.Available);
  } catch (error) {
    // During build time or when DB/API is unavailable, return empty array
    console.error("Error fetching categories:", error);
    return [];
  }
}

const ProductsMegaMenu = async () => {
  const categories = await fetchCategories();

  // Separate categories into those with and without subcategories
  const categoriesWithSubcategories = categories.filter((category) =>
    category.Subcategories.some((subCategory) => subCategory.Available)
  );

  const categoriesWithoutSubcategories = categories.filter(
    (category) => category.Subcategories.length === 0
  );

  return (
    <li className={`${styles.nav_item} ${styles.megaMenuParent}`}>
      <Link href="/products">محصولات</Link>

      <div className={styles.megaMenu}>
        {/* Categories with subcategories */}
        {categoriesWithSubcategories.map((category) => (
          <div
            key={category.CategoryID}
            className={`${styles.categoryColumn} ${styles.hasSubcategories}`}
          >
            <h3 className={styles.categoryTitle}>
              <Link href={category.Link}>{category.Name}</Link>
            </h3>
            <ul>
              {category.Subcategories.filter((subCategory) => subCategory.Available).map(
                (subCategory) => (
                  <li key={subCategory.CategoryContentId}>
                    <Link href={subCategory.Link}>{subCategory.Name}</Link>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}

        {/* Categories without subcategories */}
        {categoriesWithoutSubcategories.length > 0 && (
          <div className={styles.categoryColumn}>
            <h3 className={styles.categoryTitle}>دیگر محصولات</h3>
            <ul>
              {categoriesWithoutSubcategories.map((category) => (
                <li key={category.CategoryID}>
                  <Link href={category.Link}>{category.Name}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
};

export default ProductsMegaMenu;
