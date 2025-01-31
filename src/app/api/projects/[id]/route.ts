// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import to your Prisma setup
import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const projectId = parseInt(params.id);

    // Validate existing project
    const existingProject = await prisma.projects.findUnique({
      where: { ProjectID: projectId },
      include: { ProjectMedia: true },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "پروژه پیدا نشد" }, { status: 404 });
    }

    // Handle slug uniqueness
    const newSlug = formData.get("slug") as string;
    if (newSlug !== existingProject.Slug) {
      const slugExists = await prisma.projects.findFirst({
        where: { Slug: newSlug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "اسلاگ تکراری است" },
          { status: 400 }
        );
      }
    }

    // Update the uploadFile function in the PUT handler
    const uploadFile = async (file: File, folder: string): Promise<string> => {
      if (file.size > (folder === "videos" ? 50 : 2) * 1024 * 1024) {
        throw new Error(
          `حجم فایل از حد مجاز (${
            folder === "videos" ? 50 : 2
          } مگابایت) بیشتر است`
        );
      }

      const originalName = file.name
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-.]/g, "");
      const key = `projects/${newSlug}/${folder}/${Date.now()}_${originalName}`;

      await s3
        .putObject({
          Bucket: process.env.LIARA_BUCKET_NAME!,
          Key: key,
          Body: Buffer.from(await file.arrayBuffer()),
          ContentType: file.type,
        })
        .promise();

      return key;
    };

    const deleteFile = async (key: string) => {
      await s3
        .deleteObject({
          Bucket: process.env.LIARA_BUCKET_NAME!,
          Key: key,
        })
        .promise();
    };

    // Handle main image
    let mainImageKey = formData.get("existingMainImage") as string;
    const newMainImage = formData.get("mainImage") as File | null;
    if (newMainImage) {
      // Delete old image if it's being replaced
      if (mainImageKey) await deleteFile(mainImageKey);
      mainImageKey = await uploadFile(newMainImage, "main");
    }

    // Handle detail images
    const existingDetails = formData.getAll("existingDetailImages") as string[];
    const newDetails = formData.getAll("detailImages") as File[];
    const finalDetails = [...existingDetails];

    // Upload new detail images
    for (const file of newDetails) {
      const key = await uploadFile(file, "details");
      finalDetails.push(key);
    }

    // Find removed detail images
    const removedDetails = existingProject.ProjectMedia.filter(
      (m) => m.MediaType === "image" && !existingDetails.includes(m.MediaURL)
    ).map((m) => m.MediaURL);

    // Handle videos
    const existingVideos = formData.getAll("existingVideos") as string[];
    const newVideos = formData.getAll("videos") as File[];
    const finalVideos = [...existingVideos];

    // Upload new videos
    for (const file of newVideos) {
      const key = await uploadFile(file, "videos");
      finalVideos.push(key);
    }

    // Find removed videos
    const removedVideos = existingProject.ProjectMedia.filter(
      (m) => m.MediaType === "video" && !existingVideos.includes(m.MediaURL)
    ).map((m) => m.MediaURL);

    // Update project
    const updatedProject = await prisma.projects.update({
      where: { ProjectID: projectId },
      data: {
        Title: formData.get("title") as string,
        Description: formData.get("description") as string,
        Slug: newSlug,
        IsActive: formData.get("isActive") === "true",
        Main_img_URL: mainImageKey,
        date: formData.get("date") as string,
        city: formData.get("city") as string,
      },
    });

    // Update media relationships
    await prisma.projectMedia.deleteMany({
      where: {
        MediaURL: { in: [...removedDetails, ...removedVideos] },
      },
    });

    // Delete removed files from storage
    await Promise.all([
      ...removedDetails.map((key) => deleteFile(key)),
      ...removedVideos.map((key) => deleteFile(key)),
    ]);

    // Create new media entries
    await prisma.projectMedia.createMany({
      data: [
        ...newDetails.map(() => ({
          ProjectID: projectId,
          MediaType: "image",
          MediaURL: "", // Will be filled with actual keys from upload
        })),
        ...newVideos.map(() => ({
          ProjectID: projectId,
          MediaType: "video",
          MediaURL: "",
        })),
      ],
    });

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error: any) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: error.message || "خطا در به روز رسانی پروژه" },
      { status: 500 }
    );
  }
}

// Also add GET handler for fetching project data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.projects.findUnique({
      where: { ProjectID: parseInt(params.id) },
      include: { ProjectMedia: true },
    });

    if (!project) {
      return NextResponse.json({ error: "پروژه پیدا نشد" }, { status: 404 });
    }

    return NextResponse.json(
      {
        project,
        media: project.ProjectMedia,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات پروژه" },
      { status: 500 }
    );
  }
}
