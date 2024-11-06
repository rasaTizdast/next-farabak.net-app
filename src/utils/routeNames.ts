// src/utils/routeNames.ts

import {
  aboutUsRoutes,
  mainRoutes,
  productCategoryRoutes,
  productSubCategoryRoutes,
} from "@/constants/routeNames";

interface RouteNames {
  [key: string]: string;
}

const routeNames: RouteNames = {
  ...mainRoutes,
  ...productCategoryRoutes,
  ...productSubCategoryRoutes,
  ...aboutUsRoutes,
  "/products/search": "جستجو",
};

export const getRouteName = (path: string): string => {
  // Check for exact matches first
  if (routeNames[path]) {
    return routeNames[path];
  }

  // Split the path into parts for dynamic handling
  const parts = path.split("/").filter(Boolean);

  // Check for category route (e.g., /products/category)
  if (parts.length === 2 && parts[0] === "products") {
    const categorySlug = parts[1].toLowerCase();
    const categoryKey = `/products/${categorySlug}` as keyof RouteNames;
    if (routeNames[categoryKey]) {
      return routeNames[categoryKey]; // Return category name if found
    }
  }

  // Check for subcategory route (e.g., /products/category/subcategory)
  if (parts.length === 3 && parts[0] === "products") {
    const categorySlug = parts[1].toLowerCase();
    const subCategorySlug = parts[2].toLowerCase();
    const subCategoryKey =
      `/products/${categorySlug}/${subCategorySlug}` as keyof RouteNames;

    if (routeNames[subCategoryKey]) {
      return routeNames[subCategoryKey]; // Return subcategory name if found
    }
  }

  return "نامشخص"; // Default case for unknown paths
};

export default routeNames;
