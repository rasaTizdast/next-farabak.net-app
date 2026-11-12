import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import {
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { TAGS } from "@/lib/data/tags";
import { prisma } from "@/lib/prisma";
import {
  validateParams,
  validateBody,
  productIdParamSchema,
  updateProductSchema,
} from "@/lib/validation";

/**
 * @swagger
 * /api/admin/products/{productId}:
 *   delete:
 *     summary: Remove a product and its related data
 *     description: |
 *       Deletes a product from multiple tables: Product, ProductOverview,
 *       ProductOverviewDetails, ProductSpecs, and FAQs.
 *     tags:
 *       - Admin
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: The ID of the product to remove.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully removed product and related data.
 *       401:
 *         description: Unauthorized. The user is not logged in or does not have admin access.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(
  req: Request,
  props: { params: Promise<{ productId: string }> }
): Promise<NextResponse> {
  const params = await props.params;
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    if (auth.role !== "Admin") {
      return unauthorizedResponse("Unauthorized");
    }

    const paramResult = validateParams(params, productIdParamSchema);
    if ("error" in paramResult) return paramResult.error as NextResponse;
    const productId = paramResult.data.productId;

    // Check if the product exists in the database
    const productExists = await prisma.product.findUnique({
      where: { ProductId: productId },
    });

    if (!productExists) {
      return notFoundResponse("Product not found");
    }

    // Start a transaction to delete from multiple tables
    try {
      await prisma.$transaction([
        prisma.product.delete({
          where: { ProductId: productId },
        }),
        prisma.productOverview.deleteMany({
          where: { ProductId: productId },
        }),
        prisma.details_ProductOverviewDetails.deleteMany({
          where: { productid: productId },
        }),
        prisma.productSpecs.deleteMany({
          where: { ProductId: productId },
        }),
        prisma.fAQs.deleteMany({
          where: { ProductId: productId },
        }),
      ]);

      revalidateTag(TAGS.products, "max");
      revalidateTag(TAGS.categories, "max");
      revalidateTag(TAGS.productOverview, "max");
      revalidateTag(TAGS.productSpecs, "max");
      revalidateTag(TAGS.faqs, "max");
      revalidateTag(TAGS.sitemap, "max");
      return NextResponse.json(
        { message: "Product and related data removed successfully." },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return serverErrorResponse("Failed to remove product and related data");
    }
  } catch (error) {
    console.error(error);
    return serverErrorResponse("An unexpected error occurred.");
  }
}

/**
 * @swagger
 * /api/admin/products/{productId}:
 *   patch:
 *     summary: Update a product partially by ID
 *     description: Updates one or more fields of an existing product by providing only the fields that need changes.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 description: The name of the product
 *                 example: "Updated Product Name"
 *               Type:
 *                 type: string
 *                 description: The type of the product
 *                 example: "Electronics"
 *               Price:
 *                 type: string
 *                 description: The price of the product
 *                 example: "99.99"
 *               Discount:
 *                 type: number
 *                 description: The discount percentage for the product
 *                 example: 10
 *               CategoryContentId:
 *                 type: integer
 *                 description: The ID of the category content
 *                 example: 2
 *               img1:
 *                 type: string
 *                 description: The URL of the first image
 *                 example: "https://example.com/image1.jpg"
 *               img2:
 *                 type: string
 *                 description: The URL of the second image
 *                 example: "https://example.com/image2.jpg"
 *               Available:
 *                 type: boolean
 *                 description: Availability status of the product
 *                 example: true
 *               Description:
 *                 type: string
 *                 description: The description of the product
 *                 example: "This is a great product."
 *               CategoryId:
 *                 type: integer
 *                 description: The category ID of the product
 *                 example: 5
 *               Slug:
 *                 type: string
 *                 description: The slug for the product
 *                 example: "updated-product-slug"
 *               SEO_Title:
 *                 type: string
 *                 description: The SEO title for the product
 *                 example: "Best Product"
 *               SEO_Description:
 *                 type: string
 *                 description: The SEO description for the product
 *                 example: "This is the best product for your needs."
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ProductId:
 *                   type: integer
 *                   description: The ID of the updated product
 *                 Name:
 *                   type: string
 *                 Type:
 *                   type: string
 *                 Price:
 *                   type: string
 *                 Discount:
 *                   type: number
 *                 CategoryContentId:
 *                   type: integer
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
 *                 Slug:
 *                   type: string
 *                 SEO_Title:
 *                   type: string
 *                 SEO_Description:
 *                   type: string
 *               example:
 *                 ProductId: 123
 *                 Name: "Updated Product Name"
 *                 Type: "Electronics"
 *                 Price: "99.99"
 *                 Discount: 10
 *                 CategoryContentId: 2
 *                 img1: "https://example.com/image1.jpg"
 *                 img2: "https://example.com/image2.jpg"
 *                 Available: true
 *                 Description: "This is a great product."
 *                 CategoryId: 5
 *                 Slug: "updated-product-slug"
 *                 SEO_Title: "Best Product"
 *                 SEO_Description: "This is the best product for your needs."
 *       400:
 *         description: Invalid input or no valid fields provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No valid fields provided for update"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update product"
 */

export async function PATCH(request: Request, props: { params: Promise<{ productId: string }> }) {
  const params = await props.params;
  const paramResult = validateParams(params, productIdParamSchema);
  if ("error" in paramResult) return paramResult.error;
  const productId = paramResult.data.productId;

  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    if (auth.role !== "Admin") {
      return unauthorizedResponse("Unauthorized");
    }

    const result = await validateBody(request, updateProductSchema);
    if ("error" in result) return result.error;
    const data = result.data;

    // If no valid fields are provided, return an error
    if (Object.keys(data).length === 0) {
      return errorResponse("No valid fields provided for update", 400);
    }

    const updatedProduct = await prisma.product.update({
      where: { ProductId: productId },
      data: data as Record<string, unknown>,
    });

    revalidateTag(TAGS.products, "max");
    revalidateTag(TAGS.categories, "max");
    revalidateTag(TAGS.sitemap, "max");
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return serverErrorResponse("Failed to update product");
  }
}
