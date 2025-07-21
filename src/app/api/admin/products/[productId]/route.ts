import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

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
async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function DELETE(req: Request, props: { params: Promise<{ productId: string }> }): Promise<NextResponse> {
  const params = await props.params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userRole = decoded.role;

    if (!userRole || userRole !== "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId } = params;

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if the product exists in the database
    const productExists = await prisma.product.findUnique({
      where: { ProductId: parseInt(productId, 10) },
    });

    if (!productExists) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Start a transaction to delete from multiple tables
    try {
      await prisma.$transaction([
        prisma.product.delete({
          where: { ProductId: parseInt(productId, 10) },
        }),
        prisma.productOverview.deleteMany({
          where: { ProductId: parseInt(productId, 10) },
        }),
        prisma.details_ProductOverviewDetails.deleteMany({
          where: { productid: parseInt(productId, 10) },
        }),
        prisma.productSpecs.deleteMany({
          where: { ProductId: parseInt(productId, 10) },
        }),
        prisma.fAQs.deleteMany({
          where: { ProductId: parseInt(productId, 10) },
        }),
      ]);

      return NextResponse.json(
        { message: "Product and related data removed successfully." },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to remove product and related data" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
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
  const productId = parseInt(params.productId, 10);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userRole = decoded.role;

    if (!userRole || userRole !== "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Allowable fields for update
    const validFields = [
      "Name",
      "Type",
      "Price",
      "Discount",
      "CategoryContentId",
      "img1",
      "img2",
      "Available",
      "Description",
      "CategoryId",
      "Slug",
      "SEO_Title",
      "SEO_Description",
      "productBlog",
    ];

    // Filter out only valid fields to update
    const updateData = Object.keys(body).reduce((acc, key) => {
      if (validFields.includes(key)) {
        acc[key] = body[key];
      }
      return acc;
    }, {} as Record<string, unknown>);

    // If no valid fields are provided, return an error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { ProductId: productId },
      data: updateData,
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
