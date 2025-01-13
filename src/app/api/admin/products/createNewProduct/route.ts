import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

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
    const cookieStore = cookies();
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

    const {
      Type,
      Slug,
      keywords,
      CategoryId,
      CategoryContentId,
      Available,
      Price,
      Discount,
      Name,
      img1,
      img2,
      SEO_Title,
      SEO_Description,
    } = await request.json();

    if (
      !Type ||
      !Slug ||
      !keywords ||
      !CategoryId ||
      !CategoryContentId ||
      !Available ||
      !Price ||
      !Discount ||
      !Name ||
      !img1 ||
      !img2 ||
      !SEO_Title ||
      !SEO_Description
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate slug and type
    const existingProduct = await prisma.product.findFirst({
      where: { Slug, Type },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "A product with the same slug and type already exists" },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        Type,
        Slug,
        Description: keywords,
        CategoryId: CategoryId,
        CategoryContentId: CategoryContentId,
        Available: Available || true,
        Price: Price || "0",
        Discount: Discount || "0",
        Name,
        img1: img1,
        img2: img2,
        SEO_Title: SEO_Title || Type,
        SEO_Description: SEO_Description || Name,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
