// src/utils/routeNames.ts

interface RouteNames {
  [key: string]: string;
}

const routeNames: RouteNames = {
  "/": "صفحه اصلی",
  "/products": "محصولات",
  "/admin-panel": "پنل ادمین",
  "/dashboard": "داشبورد",
  "/products/home-edition": "دوربین های هوم ادیشن",
  "/products/conference-hall": "سالن کنفرانس و همایش",
  "/products/cctv-cameras": "دوربین‌های مداربسته تحت شبکه",
  "/products/blackmagic": "محصولات BlackMagic",
  "/products/x-ray": "دستگاه X-RAY",
  "/products/nvr": "ضبط کننده‌ها (NVR)",
  "/products/accessories": "لوازم جانبی",
  "/products/gate-door": "گیت و درب",
};

export const getRouteName = (path: string): string => {
  // Check for exact matches first
  if (routeNames[path]) {
    return routeNames[path];
  }

  // Handle product category pages dynamically
  if (path.startsWith("/products/")) {
    const parts = path.split("/");
    const categorySlug = parts[parts.length - 1]; // Get the last part of the URL

    // Check for category names using a lowercased match
    const categoryKey =
      `/products/${categorySlug.toLowerCase()}` as keyof RouteNames;
    if (routeNames[categoryKey]) {
      return routeNames[categoryKey]; // Return the name if found
    }
  }

  return "نامشخص"; // Default case for unknown paths
};

export default routeNames;
