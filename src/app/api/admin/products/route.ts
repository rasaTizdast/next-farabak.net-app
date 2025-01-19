import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all products with links to category and subcategory
 *     description: Returns a paginated list of products with their associated category and subcategory slugs included in the product links.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to fetch.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of products to return per page.
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for filtering products by description keywords.
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Filter by category ID.
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: integer
 *         description: Filter by subcategory ID.
 *       - in: query
 *         name: available
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *         description: Filter by availability status (true/false). Use 'all' to return both.
 *     responses:
 *       200:
 *         description: A paginated list of products with links
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ProductId:
 *                         type: integer
 *                       Name:
 *                         type: string
 *                       Type:
 *                         type: string
 *                       Price:
 *                         type: number
 *                       Discount:
 *                         type: number
 *                       CategoryContentId:
 *                         type: array
 *                         items:
 *                           type: string
 *                       img1:
 *                         type: string
 *                       img2:
 *                         type: string
 *                       Available:
 *                         type: boolean
 *                       Description:
 *                         type: string
 *                       CategoryId:
 *                         type: integer
 *                       productSlug:
 *                         type: string
 *                       categorySlug:
 *                         type: string
 *                       subCategorySlug:
 *                         type: string
 *                       categoryName:
 *                         type: string
 *                       subCategoryName:
 *                         type: string
 *                       link:
 *                         type: string
 *                         description: The full URL to the product.
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       404:
 *         description: No products found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const query = searchParams.get("q") || "";
  const category = parseInt(searchParams.get("category") || "0", 10);
  const subcategory = searchParams.get("subcategory") || "";
  const available = searchParams.get("available");
  const offset = (page - 1) * limit;

  try {
    const conditions: any = {};

    // Query search logic
    if (query.trim()) {
      conditions.OR = [
        { Type: { equals: query.trim(), mode: "insensitive" } }, // Match Type exactly
        { Slug: { equals: query.trim(), mode: "insensitive" } }, // Match Slug exactly
      ];
    }

    // If no products match Type or Slug, include Description search
    if (query.trim()) {
      conditions.OR.push({
        Description: {
          contains: query.trim(),
          mode: "insensitive", // Case-insensitive matching for descriptions
        },
      });
    }

    if (category > 0) {
      conditions.CategoryId = category;
    }

    if (subcategory) {
      const subcategoryIds = subcategory.split(",").map((id) => id.trim());
      conditions.OR = [
        ...(conditions.OR || []),
        ...subcategoryIds.map((id) => ({
          CategoryContentId: {
            contains: id,
            mode: "insensitive",
          },
        })),
      ];
    }

    if (available && available !== "all") {
      conditions.Available = available === "true";
    }

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where: conditions,
        skip: offset,
        take: limit,
        include: {
          Category: true,
        },
      }),
      prisma.product.count({
        where: conditions,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    if (products.length === 0) {
      return new NextResponse("No products found", { status: 404 });
    }

    const data = await Promise.all(
      products.map(async (product) => {
        const categorySlug = product.Category?.Slug || null;

        // Parse CategoryContentId string
        const categoryContentIds = product.CategoryContentId
          ? product.CategoryContentId.split(",").map((id) =>
              parseInt(id.trim(), 10)
            )
          : [];

        // Fetch all subcategories for the product
        const subCategories = await prisma.categoryContent.findMany({
          where: {
            CategoryContentId: { in: categoryContentIds },
          },
        });

        // Sort subcategories to match the order in categoryContentIds
        const sortedSubCategories = categoryContentIds
          .map((id) =>
            subCategories.find((sub) => sub.CategoryContentId === id)
          )
          .filter(Boolean); // Filter out any undefined matches

        const subCategoryName =
          sortedSubCategories.length > 0
            ? sortedSubCategories.map((sub) => sub!.Name).join(", ")
            : null;

        const categoryContentDetails = sortedSubCategories.map((sub) => ({
          CategoryContentId: sub!.CategoryContentId,
          Name: sub!.Name || "",
        }));

        const {
          ProductId,
          Name,
          Type,
          Description,
          Price,
          Available,
          Slug,
          ...rest
        } = product;

        return {
          ProductId,
          Name,
          Type: Type || "",
          Description,
          categoryName: product.Category?.Name || "",
          subCategoryName,
          productSlug: Slug || "",
          Price: parseFloat(Price || "0"),
          Available: Available || false,
          link: `${categorySlug}/${sortedSubCategories[0]?.Slug || ""}/${Slug}`,
          CategoryContentIds: categoryContentDetails,
          ...rest, // Include remaining untouched fields
        };
      })
    );

    return NextResponse.json({
      data,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new NextResponse("Failed to fetch products", { status: 500 });
  }
}
