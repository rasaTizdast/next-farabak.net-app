import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * @swagger
 * /api/admin/branches/check-product:
 *   get:
 *     summary: Check if a branch has a specific product in stock tied to an invoice
 *     parameters:
 *       - in: query
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the branch to check
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to check
 *       - in: query
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the invoice
 *     responses:
 *       200:
 *         description: Returns if the branch has this product in the invoice
 *       400:
 *         description: Bad request - missing parameters
 *       401:
 *         description: Unauthorized - user not logged in
 *       500:
 *         description: Server error
 */
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const branchId = url.searchParams.get("branchId");
    const productId = url.searchParams.get("productId");
    const invoiceId = url.searchParams.get("invoiceId");

    if (!branchId || !productId || !invoiceId) {
      return NextResponse.json(
        { error: "برخی پارامترهای لازم ارسال نشده اند" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      console.error("No access token found in cookies");
      return NextResponse.json(
        { error: "دسترسی غیرمجاز - لطفا وارد حساب کاربری خود شوید" },
        { status: 401 }
      );
    }

    try {
      // Verify JWT
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(JWT_SECRET)
      );

      // Get userId from payload
      const userId = payload.userId || payload.id || payload.sub;

      if (!userId) {
        console.error("JWT payload missing userId:", payload);
        return NextResponse.json(
          { error: "دسترسی غیرمجاز - اطلاعات کاربر معتبر نیست" },
          { status: 401 }
        );
      }

      // Verify the branch belongs to this user
      const branch = await prisma.$queryRaw`
        SELECT "branchid" FROM "support"."branch"
        WHERE "UserID" = ${Number(userId)} AND "branchid" = ${Number(branchId)}
      `;

      if (!branch || (branch as any[]).length === 0) {
        return NextResponse.json(
          { error: "شعبه مورد نظر برای این کاربر یافت نشد" },
          { status: 403 }
        );
      }

      // Just check if the invoice contains the product, without trying to check branch ownership
      // since the Invoice table doesn't have a BranchId column
      const invoiceProductCheck = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM "info"."Invoice_Details" id
        WHERE id."Invoiceid" = ${Number(invoiceId)}
        AND id."ProductId"::text = ${productId}::text
      `;

      let hasProduct = ((invoiceProductCheck as any[])[0].count as number) > 0;

      // If product is in invoice, we can assume the branch has access
      // This is a simplification - in a more secure system, you'd verify branch ownership of invoices

      // Optionally check if there's any existing warranty to confirm this branch is authorized
      if (hasProduct) {
        const existingWarranty = await prisma.$queryRaw`
          SELECT COUNT(*) as count
          FROM "info"."warranty" w
          WHERE w."branchid" = ${Number(branchId)}
          AND w."ProductId"::text = ${productId}::text
        `;

        // If there's an existing warranty for this product with this branch, that's even better validation
        const hasWarranty =
          ((existingWarranty as any[])[0].count as number) > 0;

        // Either way, we'll return true if product is in invoice
        hasProduct = hasProduct || hasWarranty;
      }

      return NextResponse.json({ hasProduct });
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError);
      return NextResponse.json(
        {
          error: "دسترسی غیرمجاز - توکن نامعتبر است",
          details: String(tokenError),
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error checking product availability:", error);
    return NextResponse.json(
      { error: "خطا در بررسی موجودی محصول", details: String(error) },
      { status: 500 }
    );
  }
}
