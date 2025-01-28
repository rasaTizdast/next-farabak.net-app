import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/members/{id}:
 *   get:
 *     summary: Get member details by ID
 *     description: Retrieve details of a member from the database using their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the member to retrieve.
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch member details from the database
    const member = await prisma.members.findUnique({
      where: {
        Membersid: parseInt(id),
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
