import { S3 } from "aws-sdk";
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
 * /api/s3/upload:
 *   post:
 *     summary: Generate a presigned URL for uploading files to S3.
 *     description: This endpoint generates a presigned URL for uploading files to S3. It validates the required parameters and sanitizes the folder name.
 *     tags:
 *       - S3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - folderName
 *               - contentType
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of the upload, e.g., "productImage" or "overviewDetails".
 *                 enum: [productImage, overviewDetails]
 *               folderName:
 *                 type: string
 *                 description: The name of the folder where the file will be uploaded.
 *               contentType:
 *                 type: string
 *                 description: The MIME type of the file being uploaded.
 *               imageType:
 *                 type: string
 *                 description: Specifies the type of image if `type` is "productImage". Possible values are "banner" or "mini".
 *     responses:
 *       200:
 *         description: Successfully generated the presigned upload URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   description: The presigned URL for uploading the file.
 *                 key:
 *                   type: string
 *                   description: The sanitized key of the uploaded file, excluding the parent folder.
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message.
 *       500:
 *         description: Internal server error. Failed to generate the upload URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message.
 */

// Initialize S3 client
const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

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

    const { type, folderName, contentType, imageType } = await request.json();

    // Validate the required parameters
    if (!type || !folderName || !contentType) {
      return NextResponse.json(
        { error: "Type, folderName, and contentType are required" },
        { status: 400 }
      );
    }

    // Sanitize folder name
    const sanitizedFolderName = folderName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Define the parent folder based on the type
    let parentFolder = "";
    let key = "";

    if (type === "productImage") {
      parentFolder = "productImages";
      if (imageType === "banner") {
        key = `${parentFolder}/${sanitizedFolderName}/${sanitizedFolderName}-banner.${
          contentType.split("/")[1]
        }`;
      } else if (imageType === "mini") {
        key = `${parentFolder}/${sanitizedFolderName}/${sanitizedFolderName}-mini.${
          contentType.split("/")[1]
        }`;
      }
    } else if (type === "overviewDetails") {
      parentFolder = "overview-details-images";
      key = `${parentFolder}/${sanitizedFolderName}.${
        contentType.split("/")[1]
      }`;
    } else {
      return NextResponse.json(
        { error: "Invalid type provided" },
        { status: 400 }
      );
    }

    // Generate a presigned URL for uploading
    const uploadUrl = await s3.getSignedUrlPromise("putObject", {
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // Remove the parent folder part from the key for the response
    const responseKey = key.substring(key.indexOf("/") + 1);

    return NextResponse.json({
      uploadUrl,
      key: responseKey, // Only return the sanitized portion of the key
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
