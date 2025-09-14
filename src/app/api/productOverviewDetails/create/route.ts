/**
 * @swagger
 * /api/productOverviewDetails/create:
 *   post:
 *     summary: Create new product overview details
 *     description: Creates multiple product overview details with images. Admin access required.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - overviewDetails
 *             properties:
 *               overviewDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - description
 *                     - image
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: object
 *                       properties:
 *                         base64:
 *                           type: string
 *                         contentType:
 *                           type: string
 *                         fileName:
 *                           type: string
 *     responses:
 *       201:
 *         description: Overview details created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */

import { S3 } from "aws-sdk";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// Ensure S3 bucket name is always a string
const BUCKET_NAME = process.env.LIARA_BUCKET_NAME || "";

// S3 client configuration (same as in the previous endpoint)
const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

// JWT verification function
async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

// Type definition for overview details
type OverviewDetail = {
  title: string;
  description: string;
  image: {
    base64: string;
    contentType: string;
    fileName?: string;
  };
};

export async function POST(req: Request) {
  try {
    // Verify admin token
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

    // Parse request body
    const { overviewDetails } = (await req.json()) as {
      overviewDetails: OverviewDetail[];
    };

    // Validate input
    if (!overviewDetails || !Array.isArray(overviewDetails) || overviewDetails.length === 0) {
      return NextResponse.json({ error: "Invalid or empty overview details" }, { status: 400 });
    }

    // Process each overview detail and create records individually
    const savedDetails: any[] = [];

    for (const detail of overviewDetails) {
      // Validate required fields
      if (!detail.title || !detail.description || !detail.image) {
        throw new Error("Missing required fields in overview detail");
      }

      // Get filename from the request or generate a unique name if not provided
      const fileName =
        detail.image.fileName ||
        `image-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      // Sanitize filename
      const sanitizedFileName = fileName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Generate key for S3 upload
      const fileExtension = detail.image.contentType.split("/")[1];
      const key = `overview-details-images/${sanitizedFileName}.${fileExtension}`;

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(detail.image.base64, "base64");

      // Upload to S3
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: imageBuffer,
        ContentType: detail.image.contentType,
      };

      // Upload to S3 and wait for the result
      await new Promise<AWS.S3.ManagedUpload.SendData>((resolve, reject) => {
        s3.upload(uploadParams, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      // Create the record in the database and let the database handle the auto-incrementing id
      const savedDetail = await prisma.master_ProductOverviewDetails.create({
        data: {
          Title: detail.title,
          Description: detail.description,
          Img: `/${key.substring(key.indexOf("/") + 1)}`, // Remove parent folder from path
        },
      });

      // Update the record to set ProductOverviewDetailsId to match the auto-generated id
      const updatedDetail = await prisma.master_ProductOverviewDetails.update({
        where: { id: savedDetail.id },
        data: { ProductOverviewDetailsId: savedDetail.id },
      });

      savedDetails.push(updatedDetail);
    }

    return NextResponse.json(
      {
        message: "Overview details uploaded successfully",
        count: savedDetails.length,
        savedDetails,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in overview details upload:", error);

    return NextResponse.json(
      {
        error: "Failed to process overview details",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
