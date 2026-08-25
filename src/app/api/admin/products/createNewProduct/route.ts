import { NextResponse } from "next/server";

import { errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateBody, createProductSchema } from "@/lib/validation";

/**
 * @swagger
 * /api/admin/products/createNewProduct:
 *   post:
 *     summary: Creates a new product in the database
 *     description: Creates a new product in the database. Ensures the slug and type are unique. Requires an admin token for authorization.
 *     tags:
 *       - NewProduct
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Type:
 *                 type: string
 *                 description: The type of the product.
 *                 example: Electronics
 *               Slug:
 *                 type: string
 *                 description: A unique slug for the product.
 *                 example: electronic-gadget
 *               CategoryId:
 *                 type: integer
 *                 description: The ID of the category the product belongs to.
 *                 example: 1
 *               CategoryContentId:
 *                 type: string
 *                 description: The ID of the category content associated with the product.
 *                 example: 101
 *               Available:
 *                 type: boolean
 *                 description: Availability status of the product.
 *                 example: true
 *               Price:
 *                 type: string
 *                 description: The price of the product.
 *                 example: "199.99"
 *               Discount:
 *                 type: string
 *                 description: The discount on the product.
 *                 example: "10"
 *               Name:
 *                 type: string
 *                 description: The name of the product.
 *                 example: Smart Watch
 *               img1:
 *                 type: string
 *                 description: URL of the first product image.
 *                 example: https://example.com/img1.jpg
 *               img2:
 *                 type: string
 *                 description: URL of the second product image.
 *                 example: https://example.com/img2.jpg
 *               SEO_Title:
 *                 type: string
 *                 description: SEO-friendly title for the product.
 *                 example: Buy Smart Watch Online
 *               SEO_Description:
 *                 type: string
 *                 description: SEO-friendly description for the product.
 *                 example: The best smart watch with top features.
 *     responses:
 *       201:
 *         description: Product created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the created product.
 *                   example: 1
 *                 Type:
 *                   type: string
 *                   description: The type of the product.
 *                 Slug:
 *                   type: string
 *                   description: A unique slug for the product.
 *                 CategoryId:
 *                   type: integer
 *                   description: The ID of the category the product belongs to.
 *                 CategoryContentId:
 *                   type: integer
 *                   description: The ID of the category content associated with the product.
 *                 Available:
 *                   type: boolean
 *                   description: Availability status of the product.
 *                 Price:
 *                   type: string
 *                   description: The price of the product.
 *                 Discount:
 *                   type: string
 *                   description: The discount on the product.
 *                 Name:
 *                   type: string
 *                   description: The name of the product.
 *                 img1:
 *                   type: string
 *                   description: URL of the first product image.
 *                 img2:
 *                   type: string
 *                   description: URL of the second product image.
 *                 SEO_Title:
 *                   type: string
 *                   description: SEO-friendly title for the product.
 *                 SEO_Description:
 *                   type: string
 *                   description: SEO-friendly description for the product.
 *       400:
 *         description: Missing required fields or duplicate slug/type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing required fields or duplicate slug/type.
 *       401:
 *         description: Unauthorized access. Admin token required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    if (auth.role !== "Admin") {
      return unauthorizedResponse("Unauthorized");
    }

    const result = await validateBody(request, createProductSchema);
    if ("error" in result) return result.error;
    const data = result.data;

    const existingProduct = await prisma.product.findFirst({
      where: { Slug: data.Slug, Type: data.Type },
    });

    if (existingProduct) {
      return errorResponse("A product with the same slug and type already exists", 400);
    }

    const newProduct = await prisma.product.create({
      data: {
        Type: data.Type,
        Slug: data.Slug,
        Description: data.Description,
        CategoryId: data.CategoryId,
        CategoryContentId: data.CategoryContentId,
        Available: data.Available || true,
        Price: data.Price || "0",
        Discount: data.Discount || "0",
        Name: data.Name,
        img1: data.img1,
        img2: data.img2,
        SEO_Title: data.SEO_Title || data.Type,
        SEO_Description: data.SEO_Description || data.Name,
        productBlog: data.productBlog,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return serverErrorResponse("Internal Server Error");
  }
}
