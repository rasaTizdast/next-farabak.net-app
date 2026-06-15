import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * @swagger
 * /api/categories/delete:
 *   delete:
 *     summary: Delete a category or subcategory along with associated products and SEO data.
 *     description: Deletes a category or subcategory and all related data, including products, product details, and SEO entries. This endpoint is restricted to Admin users.
 *     tags:
 *       - Categories
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 description: The ID of the category to delete.
 *               subCategoryId:
 *                 type: string
 *                 description: The ID of the subcategory to delete.
 *             oneOf:
 *               - required: [categoryId]
 *               - required: [subCategoryId]
 *           example:
 *             categoryId: "123"
 *     responses:
 *       200:
 *         description: Deletion successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deletion successful.
 *       400:
 *         description: Invalid request when no category or subcategory ID is provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request, no category or subcategory ID provided.
 *       401:
 *         description: Unauthorized access due to missing or invalid token, or insufficient permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error during deletion process.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Error during deletion
 */

// Helper function to delete a subcategory and related data
async function deleteSubCategory(subCategoryId: number) {
  // Delete related SEO details for subCategory
  await prisma.sEO_CategoryContent.deleteMany({
    where: { CategoryContentId: subCategoryId },
  });

  // Delete products that are associated with the subCategory
  const products = await prisma.product.findMany({
    where: {
      CategoryContentId: {
        contains: subCategoryId.toString(),
      },
    },
  });

  // Delete product images from S3 before deleting from database
  for (const product of products) {
    try {
      // Delete product images from S3
      const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
      const s3Response = await fetch(`${baseUrl}/api/s3/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "productImages",
          productId: product.ProductId,
        }),
      });

      if (s3Response.status !== 200) {
        console.error(
          `Failed to delete images for product ${product.ProductId}:`,
          await s3Response.text()
        );
      }
    } catch (error) {
      console.error(`Error deleting images for product ${product.ProductId}:`, error);
    }

    // Delete product overview, details, specs, and FAQs in parallel
    await Promise.all([
      prisma.productOverview.deleteMany({
        where: { ProductId: product.ProductId },
      }),
      prisma.details_ProductOverviewDetails.deleteMany({
        where: { productid: product.ProductId },
      }),
      prisma.productSpecs.deleteMany({
        where: { ProductId: product.ProductId },
      }),
      prisma.fAQs.deleteMany({
        where: { ProductId: product.ProductId },
      }),
    ]);
  }

  // Delete products
  await prisma.product.deleteMany({
    where: {
      CategoryContentId: {
        contains: subCategoryId.toString(),
      },
    },
  });

  // Finally, delete the subCategory itself
  await prisma.categoryContent.delete({
    where: { CategoryContentId: subCategoryId },
  });
}

// Helper function to delete a category and its subcategories and products
async function deleteCategory(categoryId: number) {
  try {
    // Delete SEO details for the category
    await prisma.sEO_Category.deleteMany({
      where: { CategoryID: categoryId },
    });

    // Fetch all subcategories for the category
    const subCategories = await prisma.categoryContent.findMany({
      where: { CategoryID: categoryId },
    });

    // Loop through each subcategory and delete it and its related data
    for (const subCategory of subCategories) {
      await deleteSubCategory(subCategory.CategoryContentId);
    }

    // Delete the category itself
    await prisma.category.delete({
      where: { CategoryID: categoryId },
    });
  } catch (error) {
    throw new Error("Failed to delete category.", error!);
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Authorization token required" }, { status: 401 });
  }

  const decoded = await verifyToken(token);
  const userRole = decoded.role;

  if (!userRole || userRole !== "Admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId, subCategoryId } = await request.json();

    if (categoryId) {
      // If a categoryId is provided, delete the category and its subcategories
      await deleteCategory(parseInt(categoryId, 10));
    } else if (subCategoryId) {
      // If a subCategoryId is provided, delete the subCategory and related products
      await deleteSubCategory(parseInt(subCategoryId, 10));
    } else {
      return NextResponse.json(
        { message: "Invalid request, no category or subcategory ID provided." },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Deletion successful." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new NextResponse("Error during deletion", { status: 500 });
    } else {
      return new NextResponse("Unexpected error during deletion", {
        status: 500,
      });
    }
  }
}
