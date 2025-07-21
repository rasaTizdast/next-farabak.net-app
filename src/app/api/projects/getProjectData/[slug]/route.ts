import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure you have a Prisma client setup

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const { slug } = params;

  try {
    // Fetch the project data based on the slug
    const project = await prisma.projects.findFirst({
      where: {
        Slug: slug,
      },
      include: {
        ProjectMedia: true, // Include associated media
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Transform the data to match the expected structure
    const projectData = {
      id: project.ProjectID,
      title: project.Title,
      date: project.date,
      images: project.ProjectMedia.filter(
        (media) => media.MediaType === "image"
      ).map((media) => ({
        id: media.MediaID,
        img: media.MediaURL,
        alt: `Project image ${media.MediaID}`,
      })),
      largeDesc: project.Description,
      location: project.city,
      video: project.ProjectMedia.find((media) => media.MediaType === "video")
        ?.MediaURL,
    };

    return NextResponse.json(projectData);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
