import { NextResponse } from "next/server";

import { getSitemapUrls } from "@/lib/data/sitemap";

/**
 * @swagger
 * /api/sitemap:
 *   get:
 *     tags:
 *       - sitemap
 *     summary: Get all URLs for the sitemap
 *     description: Returns public product, category, subcategory, blog, blog category, project, and static URLs.
 *     responses:
 *       200:
 *         description: Sitemap URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - urls
 *               properties:
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    return NextResponse.json(await getSitemapUrls());
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    return new NextResponse("Failed to generate sitemap", { status: 500 });
  }
}
