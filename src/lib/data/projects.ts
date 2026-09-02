import { prisma } from "@/lib/prisma";

import { cachedQuery } from "./cache";
import { TAGS } from "./tags";

export interface ProjectListItem {
  id: number;
  title: string;
  smallDesc: string;
  mainImg: string;
  date: string;
  location: string;
  slug: string;
  media: { type: string | null; url: string }[];
}

// ---------------------------------------------------------------------------
// /api/projects
// ---------------------------------------------------------------------------

async function queryProjects(): Promise<ProjectListItem[]> {
  const projects = await prisma.projects.findMany({
    where: { IsActive: true },
    include: {
      ProjectMedia: true,
    },
  });

  return projects.map((project) => ({
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
}

export const getProjects = cachedQuery("getProjects", queryProjects, {
  revalidate: 3600,
  tags: [TAGS.projects],
});

// ---------------------------------------------------------------------------
// /api/projects/getProjectData/:slug
// ---------------------------------------------------------------------------

export interface ProjectImage {
  id: number;
  img: string;
  alt: string;
}

export interface ProjectDetailData {
  id: number;
  title: string;
  date: string;
  images: ProjectImage[];
  largeDesc: string;
  location: string;
  video: string | undefined;
}

async function queryProjectData(slug: string): Promise<ProjectDetailData | null> {
  const project = await prisma.projects.findFirst({
    where: {
      Slug: slug,
    },
    include: {
      ProjectMedia: true,
    },
  });

  if (!project) {
    return null;
  }

  return {
    id: project.ProjectID,
    title: project.Title,
    date: project.date,
    images: project.ProjectMedia.reduce<ProjectImage[]>((acc, media) => {
      if (media.MediaType === "image") {
        acc.push({
          id: media.MediaID,
          img: media.MediaURL,
          alt: `Project image ${media.MediaID}`,
        });
      }
      return acc;
    }, []),
    largeDesc: project.Description,
    location: project.city,
    video: project.ProjectMedia.find((media) => media.MediaType === "video")?.MediaURL,
  };
}

export const getProjectData = cachedQuery("getProjectData", queryProjectData, {
  revalidate: 3600,
  tags: [TAGS.projects],
});
