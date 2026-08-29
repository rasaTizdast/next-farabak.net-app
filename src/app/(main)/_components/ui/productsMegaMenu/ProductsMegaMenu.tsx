// ProductsMegaMenu.tsx (Server Component) — fetches categories, renders the client mega-menu

import { fetchMenuCategories } from "@/helpers/menuHelpers";

import ProductsMegaMenuContent from "./ProductsMegaMenuContent";

const ProductsMegaMenu = async () => {
  const categories = await fetchMenuCategories();

  const categoriesWithSubcategories = categories.filter((category) =>
    category.Subcategories.some((subCategory) => subCategory.Available)
  );

  const categoriesWithoutSubcategories = categories.filter(
    (category) => !category.Subcategories.some((subCategory) => subCategory.Available)
  );

  return (
    <ProductsMegaMenuContent
      categoriesWithSubcategories={categoriesWithSubcategories}
      categoriesWithoutSubcategories={categoriesWithoutSubcategories}
    />
  );
};

export default ProductsMegaMenu;
