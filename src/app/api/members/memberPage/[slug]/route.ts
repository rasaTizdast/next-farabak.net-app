import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/members/memberPage/{slug}:
 *   get:
 *     summary: Get member details by slug
 *     description: Retrieve details of a member from the database using their slug.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: integer
 *         description: The slug of the member to retrieve.
 *     responses:
 *       200:
 *         description: Member details retrieved successfully.
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
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Fetch member details from the database
    const member = await prisma.members.findUnique({
      where: {
        Slug: slug,
      },
    });

    if (!member) {
      return NextResponse.json(
        { message: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(member, { status: 200 });
  } catch (error) {
    console.error("Error fetching member details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
