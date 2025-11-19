import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/products/getProductBySlug/{productSlug}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get a product by Slug
 *     description: Returns a specific product based on the product Slug, including category and subcategory slugs.
 *     parameters:
 *       - in: path
 *         name: productSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug of the product to fetch
 *     responses:
 *       200:
 *         description: A specific product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ProductId:
 *                   type: integer
 *                 Name:
 *                   type: string
 *                 Type:
 *                   type: string
 *                 Price:
 *                   type: number
 *                   nullable: true
 *                 Discount:
 *                   type: number
 *                   nullable: true
 *                 CategoryContentId:
 *                   type: string
 *                 img1:
 *                   type: string
 *                 img2:
 *                   type: string
 *                 Available:
 *                   type: boolean
 *                 Description:
 *                   type: string
 *                 CategoryId:
 *                   type: integer
 *                 categorySlug:
 *                   type: string
 *                 subCategorySlug:
 *                   type: string
 *                 QrCode_Keys:
 *                   type: string
 *                 QrCode_expiryDays:
 *                   type: string
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request, props: { params: Promise<{ productSlug: string }> }) {
  const params = await props.params;
  try {
    const { productSlug } = params;

    // Convert the productSlug from the URL to lowercase
    const lowerCaseProductSlug = productSlug.toLowerCase();

    // Find the product using findFirst, comparing the slug in lowercase
    const product = await prisma.product.findFirst({
      where: {
        Slug: {
          equals: lowerCaseProductSlug, // Compare slugs in lowercase
          mode: "insensitive", // Ensure case-insensitive comparison in Prisma
        },
      },
      include: {
        Category: {
          select: {
            Slug: true,
          },
        },
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Split the CategoryContentId string and handle both cases (single ID or comma-separated IDs)
    const categoryContentIds = product.CategoryContentId?.split(",") || [];
    const firstCategoryContentId = categoryContentIds[0];

    // Fetch related CategoryContent data using the first CategoryContentId
    const subCategorySlug = firstCategoryContentId
      ? (
          await prisma.categoryContent.findFirst({
            where: { CategoryContentId: Number(firstCategoryContentId) }, // Use first ID as an integer
            select: { Slug: true },
          })
        )?.Slug
      : null;

    const responseData = {
      ProductId: product.ProductId,
      Name: product.Name,
      Type: product.Type,
      Price: product.Price,
      Discount: product.Discount,
      CategoryContentId: product.CategoryContentId,
      img1: product.img1,
      img2: product.img2,
      Available: product.Available,
      Description: product.Description,
      CategoryId: product.CategoryId,
      productSlug: product.Slug,
      categorySlug: product.Category?.Slug || null,
      subCategorySlug: subCategorySlug || null,
      SEO_Title: product.SEO_Title,
      SEO_Description: product.SEO_Description,
      QrCode_key: product.QrCode_Key,
      QrCode_expiryDays: product.QrCode_expiryDays,
      productBlog: product.productBlog,
      Minimum_Amount: product.Minimum_Amount,
      Maximum_Amount: product.Maximum_Amount,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to fetch product", { status: 500 });
  }
}
