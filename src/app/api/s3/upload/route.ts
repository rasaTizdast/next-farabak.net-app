import { S3 } from "aws-sdk";
import { NextResponse } from "next/server";

// Initialize S3 client
const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

// Logger utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || "");
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  },
};

/**
 * POST handler for uploading a file
 * Route: /api/s3/upload
 */
export async function POST(request: Request) {
  try {
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
      } else {
        key = `${parentFolder}/${sanitizedFolderName}/${sanitizedFolderName}.${
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

    logger.info("Generated presigned URL", { key });

    return NextResponse.json({
      uploadUrl,
      key,
    });
  } catch (error) {
    logger.error("Failed to generate presigned URL", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
