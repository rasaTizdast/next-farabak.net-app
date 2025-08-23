import { S3 } from "aws-sdk";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const desc = formData.get("desc") as string;
    const phone = formData.get("phone") as string;
    const slug = formData.get("slug") as string;

    let imageUrl = "";

    if (file) {
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

    const newMember = await prisma.members.create({
      data: {
        main_pic: imageUrl,
        Name: name,
        Role: role,
        main_description: desc,
        phonenumber: phone,
        Slug: slug,
      },
    });

    return NextResponse.json(newMember);
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json({ error: "خطا در ایجاد عضو." }, { status: 500 });
  }
}
