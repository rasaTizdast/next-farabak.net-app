import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/sitemap/products:
 *   get:
 *     tags:
 *       - sitemap
 *     summary: Get all product URLs for sitemap
 *     description: Returns a list of all product URLs, including category, subcategory, and product slugs for generating a sitemap.
 *     responses:
 *       200:
 *         description: A list of product URLs for the sitemap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: The URL for a product
 *       404:
 *         description: No products found
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    // Fetch products with category and subcategory slugs
    const products = await prisma.product.findMany({
      include: {
        Category: {
          select: {
            Slug: true,
          },
        },
      },
    });

    if (products.length === 0) {
      return new NextResponse("No products found", { status: 404 });
    }

    // Map product data to URLs
    const urls = await Promise.all(
      products.map(async (product) => {
        const categorySlug = product.Category?.Slug || null;

        // Parse CategoryContentId string
        const categoryContentIds = product.CategoryContentId
          ? product.CategoryContentId.split(",").map((id) =>
              parseInt(id.trim(), 10)
            )
          : [];

        // Fetch first matching subcategory
        const subCategory = await prisma.categoryContent.findFirst({
          where: {
            CategoryContentId: { in: categoryContentIds },
          },
        });

        return `https://farabak.net/products/${categorySlug}/${subCategory?.Slug}/${product.Slug}`;
      })
    );

    return NextResponse.json({ urls });
  } catch (error) {
    return new NextResponse("Failed to generate sitemap", { status: 500 });
  }
}
