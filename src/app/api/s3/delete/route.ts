import { S3 } from "aws-sdk";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import to your Prisma setup

/**
 * @swagger
 * /api/s3/delete:
 *   delete:
 *     summary: Delete images from S3 bucket.
 *     description: |
 *       This endpoint deletes images from the S3 bucket based on the provided parameters.
 *       - If `type` is `productImages`, the endpoint can delete either:
 *         - All images in the product's folder if `productImageType` is not provided.
 *         - A specific image (`img1` or `img2`) if `productImageType` is provided.
 *       - If `type` is `overview-details-image`, a specific image is deleted using the provided `imageKey`.
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
 *               - productId
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of the image to delete, either "productImages" or "overview-details-image".
 *                 enum: [productImages, overview-details-image]
 *               productId:
 *                 type: number
 *                 description: The product ID to identify the folder for deletion.
 *               imageKey:
 *                 type: string
 *                 description: The key of the specific image to delete (required for `overview-details-image` type).
 *               productImageType:
 *                 type: string
 *                 description: |
 *                   Optional. The specific type of product image to delete, either "mini" or "banner".
 *                   - If provided, only deletes the image specified in the `img1` or `img2` field of the product.
 *                   - If not provided, deletes all images in the product's folder.
 *                 enum: [mini, banner]
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
 *                 deleteResponse:
 *                   type: object
 *                   description: Response from S3 about the deleted objects.
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       404:
 *         description: Not found. The requested resource does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal server error. Failed to delete the image.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                 error:
 *                   type: object
 *                   description: Details about the server error.
 */

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { type, productId, imageKey, productImageType } = body;

    if (!type || !productId) {
      return NextResponse.json(
        { message: "Type and productId are required." },
        { status: 400 }
      );
    }

    // Fetch the product's slug and image fields from the database
    const product = await prisma.product.findUnique({
      where: { ProductId: parseInt(productId, 10) },
      select: { Slug: true, img1: true, img2: true },
    });

    if (!product || !product.Slug) {
      return NextResponse.json(
        { message: "Product not found or slug is missing." },
        { status: 404 }
      );
    }

    const slug = product.Slug;

    if (type === "productImages") {
      if (productImageType) {
        let imageToDelete: string | null = null;

        if (productImageType === "mini") {
          imageToDelete = product.img1;
        } else if (productImageType === "banner") {
          imageToDelete = product.img2;
        } else {
          return NextResponse.json(
            {
              message: "Invalid productImageType. Must be 'mini' or 'banner'.",
            },
            { status: 400 }
          );
        }

        if (!imageToDelete) {
          return NextResponse.json(
            { message: "No image found for the specified productImageType." },
            { status: 404 }
          );
        }

        const deleteParams = {
          Bucket: process.env.LIARA_BUCKET_NAME as string,
          Key: `productImages/${imageToDelete}`,
        };

        try {
          const deleteResponse = await s3.deleteObject(deleteParams).promise();

          return NextResponse.json(
            {
              message: "Image deleted successfully.",
              deletedKey: `productImages/${imageToDelete}`,
              deleteResponse,
            },
            { status: 200 }
          );
        } catch (error) {
          console.error("Failed to delete image:", error);

          return NextResponse.json(
            { message: "Failed to delete image.", error },
            { status: 500 }
          );
        }
      } else {
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
          console.error("Failed to delete folder contents:", error);
          return NextResponse.json(
            { message: "Failed to delete folder contents.", error },
            { status: 500 }
          );
        }
      }
    } else if (type === "overview-details-image") {
      if (!imageKey) {
        return NextResponse.json(
          { message: "imageKey is required for deleting a specific image." },
          { status: 400 }
        );
      }

      try {
        const deleteParams = {
          Bucket: process.env.LIARA_BUCKET_NAME as string,
          Key: imageKey,
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
        console.error("Failed to delete image:", error);
        return NextResponse.json(
          { message: "Failed to delete image.", error },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Invalid type provided." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Unexpected error occurred:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred.", error },
      { status: 500 }
    );
  }
}
