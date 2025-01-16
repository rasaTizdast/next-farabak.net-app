import { S3 } from "aws-sdk";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import to your Prisma setup

/**
 * @swagger
 * /api/s3/delete:
 *   delete:
 *     summary: Delete images from S3 bucket.
 *     description: This endpoint deletes images from the S3 bucket based on the provided productId (for product images) or overviewDetails name (for overview-details images).
 *       - S3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of the image to delete, either "productImages" or "overview-details-image".
 *                 enum: [productImages, overview-details-image]
 *               productId:
 *                 type: number
 *                 description: The product ID to identify the folder to delete from productImages.
 *               overviewName:
 *                 type: string
 *                 description: The name of the overviewDetails image to delete.
 *     responses:
 *       200:
 *         description: Successfully deleted the image(s).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       404:
 *         description: Not found. The requested resource does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal server error. Failed to delete the image.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();

    const { type, productId, imageKey } = body;

    if (!type || !productId) {
      return NextResponse.json(
        { message: "Type and productId are required." },
        { status: 400 }
      );
    }

    // Fetch the product's slug from the database
    const product = await prisma.product.findUnique({
      where: { ProductId: parseInt(productId, 10) },
      select: { Slug: true },
    });

    if (!product || !product.Slug) {
      return NextResponse.json(
        { message: "Product not found or slug is missing." },
        { status: 404 }
      );
    }

    const slug = product.Slug;

    if (type === "productImages") {
      // Delete all files in the folder (as explained previously)
      const folderKey = `productImages/${slug}/`;

      try {
        const listResponse = await s3
          .listObjectsV2({
            Bucket: process.env.LIARA_BUCKET_NAME as string,
            Prefix: folderKey,
          })
          .promise();

        const objectsToDelete = listResponse.Contents;

        if (!objectsToDelete || objectsToDelete.length === 0) {
          return NextResponse.json(
            { message: "Folder is empty or does not exist." },
            { status: 404 }
          );
        }

        const deleteParams = {
          Bucket: process.env.LIARA_BUCKET_NAME as string,
          Delete: {
            Objects: objectsToDelete.map((obj) => ({ Key: obj.Key! })),
          },
        };

        const deleteResponse = await s3.deleteObjects(deleteParams).promise();

        return NextResponse.json(
          {
            message: "Folder and its contents deleted successfully.",
            deleteResponse,
          },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json(
          { message: "Failed to delete folder contents.", error },
          { status: 500 }
        );
      }
    } else if (type === "overview-details-image") {
      // Delete a specific image (imageKey must be provided)
      if (!imageKey) {
        return NextResponse.json(
          { message: "imageKey is required for deleting a specific image." },
          { status: 400 }
        );
      }

      try {
        const deleteParams = {
          Bucket: process.env.LIARA_BUCKET_NAME as string,
          Key: imageKey, // Full key of the image
        };

        const deleteResponse = await s3.deleteObject(deleteParams).promise();

        if (deleteResponse.DeleteMarker) {
          return NextResponse.json(
            { message: "Image deleted successfully.", deleteResponse },
            { status: 200 }
          );
        } else {
          return NextResponse.json(
            { message: "Image not deleted. Check the provided key." },
            { status: 404 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { message: "Failed to delete image.", error },
          { status: 500 }
        );
      }
    } else {
      // Handle invalid types
      return NextResponse.json(
        { message: "Invalid type provided." },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "An unexpected error occurred.", error },
      { status: 500 }
    );
  }
}
