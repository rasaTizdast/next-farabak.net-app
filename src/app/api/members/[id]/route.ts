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

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const desc = formData.get("desc") as string;
    const phone = formData.get("phone") as string;
    const slug = formData.get("slug") as string;

    if (!id) {
      return NextResponse.json(
        { error: "شناسه عضو الزامی است." },
        { status: 400 }
      );
    }

    // Fetch the existing member data
    const existingMember = await prisma.members.findUnique({
      where: { Membersid: parseInt(id) },
    });

    if (!existingMember) {
      return NextResponse.json({ error: "عضو یافت نشد." }, { status: 404 });
    }

    let imageUrl = existingMember.main_pic;

    // If a new file is uploaded, handle the image upload and deletion of the old image
    if (file) {
      // Delete the previous image from S3 if it exists
      if (existingMember.main_pic) {
        const oldImageKey = existingMember.main_pic.split("/").pop();
        await s3
          .deleteObject({
            Bucket: process.env.LIARA_BUCKET_NAME!,
            Key: `member-images/${oldImageKey}`,
          })
          .promise();
      }

      // Upload the new file to S3
      const buffer = Buffer.from(await file.arrayBuffer());
      const key = `member-images/${file.name}`;

      await s3
        .putObject({
          Bucket: process.env.LIARA_BUCKET_NAME!,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        })
        .promise();

      imageUrl = file.name;
    }

    // Update the member details in the database
    const updatedMember = await prisma.members.update({
      where: { Membersid: parseInt(id) },
      data: {
        main_pic: imageUrl,
        Name: name,
        Role: role,
        main_description: desc,
        phonenumber: phone,
        Slug: slug,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی عضو." },
      { status: 500 }
    );
  }
}
