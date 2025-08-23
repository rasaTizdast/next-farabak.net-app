import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/breadcrumbs:
 *   post:
 *     summary: Retrieve breadcrumb names for given paths.
 *     description: Accepts an array of paths and returns the corresponding breadcrumb names for those paths. Handles both static routes and dynamic product category/subcategory routes.
 *     tags:
 *       - Breadcrumbs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paths:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["/", "/products", "/products/home-edition/battery"]
 *     responses:
 *       200:
 *         description: Successfully retrieved breadcrumb names.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: string
 *               example:
 *                 "/": "صفحه اصلی"
 *                 "/products": "محصولات"
 *                 "/products/home-edition/battery": "دوربین باطری دار"
 *       400:
 *         description: Bad request. The input data is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid input data."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */

export async function POST(request: Request) {
  const { paths } = await request.json();

  // Static routes (you can reuse your existing constants)
  const staticRoutes: Record<string, string> = {
    "/": "صفحه اصلی",
    "/products": "محصولات",

    "/admin-panel": "پنل ادمین",
    "/dashboard": "داشبورد",

    "/about-us": "درباره ما",
    "/about-us/projects": "گالری تصاویر پروژه‌ها",
    "/about-us/members": "اعضای هیئت مدیره",

    "/support": "پشتیبانی",
    "/support/blog": "بلاگ",
  };

  const results: Record<string, string> = {};

  for (const path of paths) {
    if (staticRoutes.hasOwnProperty(path)) {
      results[path] = staticRoutes[path];
      continue;
    }

    const parts = path.split("/").filter(Boolean);
    if (parts.length === 2 && parts[0] === "products") {
      // It's a category
      const slug = parts[1];
      const category = await prisma.category.findFirst({
        where: { Slug: slug, Available: true },
        select: { Name: true },
      });

      if (category?.Name) {
        results[path] = category.Name;
      } else {
        results[path] = "نامشخص";
      }
    } else if (parts.length === 3 && parts[0] === "products") {
      // It's a subcategory
      const slug = parts[2];
      const subCategory = await prisma.categoryContent.findFirst({
        where: { Slug: slug, Available: true },
        select: { Name: true },
      });

      if (subCategory?.Name) {
        results[path] = subCategory.Name;
      } else {
        results[path] = "نامشخص";
      }
    } else {
      results[path] = "نامشخص";
    }
  }

  return NextResponse.json(results);
}
