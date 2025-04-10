// ProductsMegaMenu.tsx (Server + Client)

import Link from "next/link";
import styles from "./ProductsMegaMenu.module.css";
import axios from "axios";

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

// Fetch data on the server
async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/getAll`
    );

    if (!res.status) {
      console.error("Fetch failed with status");
      return []; // Return empty array instead of throwing
    }

    const categories: Category[] = await res.data;
    return categories.filter((category) => category.Available);
  } catch (error) {
    // During build time or when API is unavailable, return empty array
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
              {category.Subcategories.filter(
                (subCategory) => subCategory.Available
              ).map((subCategory) => (
                <li key={subCategory.CategoryContentId}>
                  <Link href={subCategory.Link}>{subCategory.Name}</Link>
                </li>
              ))}
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
