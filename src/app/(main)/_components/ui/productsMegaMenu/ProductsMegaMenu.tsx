"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ProductsMegaMenu.module.css";
import categoryData from "@/constants/categoryData.json";

const ProductsMegaMenu = () => {
  // State to control the visibility of the menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Separate categories with and without subcategories
  const categoriesWithSubcategories = categoryData.filter(
    (category) => category.subCategories.length > 0
  );
  const categoriesWithoutSubcategories = categoryData.filter(
    (category) => category.subCategories.length === 0
  );

  // Function to close the menu when a link is clicked
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <li
      className={`${styles.nav_item} ${styles.megaMenuParent}`}
      onMouseEnter={() => setIsMenuOpen(true)} // Open the menu on hover
      onMouseLeave={() => setIsMenuOpen(false)} // Close the menu on mouse leave
    >
      <Link href="/products">محصولات</Link>

      {/* Conditionally render the mega menu */}
      {isMenuOpen && (
        <div className={styles.megaMenu}>
          {/* Categories with subcategories */}
          {categoriesWithSubcategories.map((category) => (
            <div
              key={category.categoryId}
              className={`${styles.categoryColumn} ${styles.hasSubcategories}`}
            >
              <h3 className={styles.categoryTitle}>
                <Link href={category.link} onClick={handleLinkClick}>
                  {category.category}
                </Link>
              </h3>
              <ul>
                {category.subCategories.map((subCategory) => (
                  <li key={subCategory.id}>
                    <Link href={subCategory.link} onClick={handleLinkClick}>
                      {subCategory.subCategory}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* "دیگر محصولات" group - styled exactly like other categories */}
          {categoriesWithoutSubcategories.length > 0 && (
            <div className={styles.categoryColumn}>
              <h3 className={styles.categoryTitle}>دیگر محصولات</h3>
              <ul>
                {categoriesWithoutSubcategories.map((category) => (
                  <li key={category.categoryId}>
                    <Link href={category.link} onClick={handleLinkClick}>
                      {category.category}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default ProductsMegaMenu;
