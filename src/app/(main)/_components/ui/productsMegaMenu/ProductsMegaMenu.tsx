"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./ProductsMegaMenu.module.css";
import axios from "axios";

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

// Category type
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

const ProductsMegaMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsloading] = useState(true);

  const fetchCategories = async () => {
    try {
      setIsloading(true);
      const res = await axios.get("/api/categories/getAll");
      setCategories(res.data);
      setIsloading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const categoriesWithSubcategories = categories.filter(
    (category: Category) => category.Subcategories.length > 0
  );
  const categoriesWithoutSubcategories = categories.filter(
    (category: Category) => category.Subcategories.length === 0
  );

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <li
      className={`${styles.nav_item} ${styles.megaMenuParent}`}
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      <Link href="/products">محصولات</Link>

      {isMenuOpen && (
        <div className={styles.megaMenu}>
          {isLoading ? (
            <div className="flex flex-wrap justify-evenly gap-4 w-full">
              {/* Skeleton for categories */}
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse flex flex-col gap-3 w-72 p-4 bg-gray-100 rounded-md"
                >
                  <div className="h-5 bg-gray-300 rounded w-2/4"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((__, subIndex) => (
                      <div
                        key={subIndex}
                        className="h-4 bg-gray-300 rounded w-full"
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Categories with subcategories */}
              {categoriesWithSubcategories.map((category: Category) => (
                <div
                  key={category.CategoryID}
                  className={`${styles.categoryColumn} ${styles.hasSubcategories}`}
                >
                  <h3 className={styles.categoryTitle}>
                    <Link href={category.Link} onClick={handleLinkClick}>
                      {category.Name}
                    </Link>
                  </h3>
                  <ul>
                    {category.Subcategories.map((subCategory: Subcategory) => (
                      <li key={subCategory.CategoryContentId}>
                        <Link href={subCategory.Link} onClick={handleLinkClick}>
                          {subCategory.Name}
                        </Link>
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
                    {categoriesWithoutSubcategories.map(
                      (category: Category) => (
                        <li key={category.CategoryID}>
                          <Link href={category.Link} onClick={handleLinkClick}>
                            {category.Name}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default ProductsMegaMenu;
