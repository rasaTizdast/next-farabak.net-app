import { S3 } from "aws-sdk";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({ error: "شناسه عضو الزامی است." }, { status: 400 });
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
    return NextResponse.json({ error: "خطا در به‌روزرسانی عضو." }, { status: 500 });
  }
}
