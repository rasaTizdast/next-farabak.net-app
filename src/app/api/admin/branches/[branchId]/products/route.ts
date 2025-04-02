import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/admin/branches/{branchId}/products:
 *   get:
 *     summary: Get all products for a specific branch
 *     parameters:
 *       - name: branchId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the branch
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of products for the branch
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
export async function GET(
  request: Request,
  { params }: { params: { branchId: string } }
) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    const branchId = parseInt(params.branchId);
    
    // Check if branch exists
    const branchResult = await prisma.$queryRaw`
      SELECT * FROM "support"."branch"
      WHERE "branchid" = ${branchId}
    `;
    
    const branch = (branchResult as any[])[0];
    
    if (!branch) {
      return NextResponse.json(
        { error: 'شعبه یافت نشد' },
        { status: 404 }
      );
    }
    
    // Get total count of branch products
    const countResult = await prisma.$queryRaw`
      SELECT COUNT(*) as total 
      FROM "support"."branchproduct" 
      WHERE "branchid" = ${branchId}
    `;
    
    const totalCount = Number((countResult as any[])[0].total);
    
    // Get branch products with product details with pagination
    const branchProducts = await prisma.$queryRaw`
      SELECT 
        bp."branchproductid",
        bp."branchid",
        bp."ProductId",
        bp."quantity",
        p."Type",
        p."img1" as "Image",
        p."Price",
        p."Discount"
      FROM "support"."branchproduct" bp
      JOIN "support"."Product" p ON bp."ProductId" = p."ProductId"
      WHERE bp."branchid" = ${branchId}
      ORDER BY p."Type"
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    
    // Calculate pagination details
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      data: branchProducts,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    console.error('Error fetching branch products:', error);
    return NextResponse.json(
      { error: 'خطا در بارگذاری محصولات شعبه' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/branches/{branchId}/products:
 *   post:
 *     summary: Add a product to a branch
 *     parameters:
 *       - name: branchId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the branch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product added to branch
 *       400:
 *         description: Bad request - missing fields or product already exists
 *       404:
 *         description: Branch or product not found
 *       500:
 *         description: Server error
 */
export async function POST(
  request: Request,
  { params }: { params: { branchId: string } }
) {
  try {
    const branchId = parseInt(params.branchId);
    const { productId, quantity } = await request.json();
    
    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'شناسه محصول و تعداد الزامی است' },
        { status: 400 }
      );
    }
    
    // Check if branch exists
    const branchResult = await prisma.$queryRaw`
      SELECT * FROM "support"."branch"
      WHERE "branchid" = ${branchId}
    `;
    
    if ((branchResult as any[]).length === 0) {
      return NextResponse.json(
        { error: 'شعبه یافت نشد' },
        { status: 404 }
      );
    }
    
    // Check if product exists
    const productResult = await prisma.$queryRaw`
      SELECT * FROM "support"."Product"
      WHERE "ProductId" = ${productId}
    `;
    
    if ((productResult as any[]).length === 0) {
      return NextResponse.json(
        { error: 'محصول یافت نشد' },
        { status: 404 }
      );
    }
    
    // Check if product already exists in branch
    const existingProduct = await prisma.$queryRaw`
      SELECT * FROM "support"."branchproduct"
      WHERE "branchid" = ${branchId} AND "ProductId" = ${productId}
    `;
    
    if ((existingProduct as any[]).length > 0) {
      // If product exists, update quantity
      const updatedProduct = await prisma.$queryRaw`
        UPDATE "support"."branchproduct"
        SET "quantity" = "quantity" + ${quantity}
        WHERE "branchid" = ${branchId} AND "ProductId" = ${productId}
        RETURNING *
      `;
      
      return NextResponse.json((updatedProduct as any[])[0], { status: 200 });
    }
    
    // Add product to branch
    const newBranchProduct = await prisma.$queryRaw`
      INSERT INTO "support"."branchproduct" ("branchid", "ProductId", "quantity")
      VALUES (${branchId}, ${productId}, ${quantity})
      RETURNING *
    `;
    
    return NextResponse.json((newBranchProduct as any[])[0], { status: 201 });
  } catch (error) {
    console.error('Error adding product to branch:', error);
    return NextResponse.json(
      { error: 'خطا در افزودن محصول به شعبه' },
      { status: 500 }
    );
  }
} 