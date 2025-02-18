import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: Get members details
 *     description: Retrieve details of members from the database.
 *     responses:
 *       200:
 *         description: Members details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Membersid:
 *                   type: integer
 *                 main_pic:
 *                   type: string
 *                 Name:
 *                   type: string
 *                 Role:
 *                   type: string
 *                 main_description:
 *                   type: string
 *                 Slug:
 *                   type: string
 *                 phonenumber:
 *                   type: string
 *       404:
 *         description: Member not found.
 *       500:
 *         description: Internal server error.
 */
export async function GET() {
  try {
    // Fetch member details from the database
    const member = await prisma.members.findMany({
      orderBy: { Membersid: "asc" },
    });

    if (!member) {
      return NextResponse.json(
        { message: "Members not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(member, { status: 200 });
  } catch (error) {
    console.error("Error fetching members details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
