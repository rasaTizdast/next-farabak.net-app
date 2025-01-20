import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

/**
 * @swagger
 * /api/uploads:
 *   post:
 *     tags:
 *       - Uploads
 *     summary: Upload an image file
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: The image file to upload
 *     responses:
 *       200:
 *         description: Successfully uploaded the image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 url:
 *                   type: string
 *                   example: "/uploads/your-image-file.jpg"
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "No file uploaded"
 */

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get("image") as unknown as File;

  // If no file was uploaded
  if (!file) {
    return NextResponse.json({ success: 0, error: "No file uploaded" });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save file to the public/uploads directory
  const filePath = join("./public/uploads", file.name);
  await writeFile(filePath, buffer);

  // Construct the file URL
  const fileUrl = `/uploads/${file.name}`;

  return NextResponse.json({ success: 1, file: { url: fileUrl } });
}
