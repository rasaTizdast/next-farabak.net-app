import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3 } from "aws-sdk";

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
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const memberId = parseInt(params.id);

    // Find the member to get image information
    const member = await prisma.members.findFirst({
      where: { Membersid: memberId },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Delete image from S3 if exists
    if (member.main_pic) {
      await s3
        .deleteObject({
          Bucket: process.env.LIARA_BUCKET_NAME!,
          Key: `member-images/${member.main_pic}`,
        })
        .promise();
    }

    // Delete member from database
    await prisma.members.delete({
      where: { Membersid: memberId },
    });

    return NextResponse.json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json(
      { error: "Error deleting member" },
      { status: 500 }
    );
  }
}
