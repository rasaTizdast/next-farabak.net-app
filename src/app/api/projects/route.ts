// app/api/projects/route.ts
import { S3 } from "aws-sdk";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma"; // Adjust the import to your Prisma setup

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

export async function GET() {
  try {
    const projects = await prisma.projects.findMany({
      where: { IsActive: true },
      include: {
        ProjectMedia: true,
      },
    });

    if (!projects.length) {
      return NextResponse.json({ message: "No projects found" }, { status: 404 });
    }

    // Transform the data to match your frontend needs
    const transformedProjects = projects.map((project) => ({
      id: project.ProjectID,
      title: project.Title,
      smallDesc: project.Description,
      mainImg: project.Main_img_URL,
      date: project.date,
      location: project.city,
      slug: project.Slug,
      media: project.ProjectMedia.map((media) => ({
        type: media.MediaType,
        url: media.MediaURL,
      })),
    }));

    return NextResponse.json(transformedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Validate required fields
    const requiredFields = ["title", "description", "slug", "date", "city", "mainImage"];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return NextResponse.json({ error: `فیلد ${field} الزامی است` }, { status: 400 });
      }
    }

    const slug = formData.get("slug") as string;

    // Check for existing project
    const existingProject = await prisma.projects.findFirst({
      where: { Slug: slug },
    });
    if (existingProject) {
      return NextResponse.json({ error: "پروژه با این اسلاگ وجود دارد" }, { status: 400 });
    }

    // File upload handler
    const uploadFile = async (file: File, folder: string) => {
      if (file.size > (folder === "videos" ? 50 : 2) * 1024 * 1024) {
        throw new Error(`File size exceeds ${folder === "videos" ? 50 : 2}MB limit`);
      }

      const originalName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-.]/g, "");
      const key = `projects/${slug}/${folder}/${Date.now()}_${originalName}`;

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

    // Upload main image
    const mainImage = formData.get("mainImage") as File;
    const mainImageKey = await uploadFile(mainImage, "main");

    // Create project
    const project = await prisma.projects.create({
      data: {
        Title: formData.get("title") as string,
        Description: formData.get("description") as string,
        Slug: slug,
        IsActive: formData.get("isActive") === "true",
        Main_img_URL: mainImageKey,
        date: formData.get("date") as string,
        city: formData.get("city") as string,
      },
    });

    // Upload detail images
    const detailImages = formData.getAll("detailImages") as File[];
    if (detailImages.length > 0) {
      await Promise.all(
        detailImages.map(async (image) => {
          const imageKey = await uploadFile(image, "details");
          return prisma.projectMedia.create({
            data: {
              ProjectID: project.ProjectID,
              MediaType: "image",
              MediaURL: imageKey,
            },
          });
        })
      );
    }

    // Upload videos
    const videos = formData.getAll("videos") as File[];
    if (videos.length > 0) {
      await Promise.all(
        videos.map(async (video) => {
          const videoKey = await uploadFile(video, "videos");
          return prisma.projectMedia.create({
            data: {
              ProjectID: project.ProjectID,
              MediaType: "video",
              MediaURL: videoKey,
            },
          });
        })
      );
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: error || "خطا در ایجاد پروژه" }, { status: 500 });
  }
}
