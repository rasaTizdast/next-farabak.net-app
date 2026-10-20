import { cacheLife, cacheTag } from "next/cache";

import { getProjects, type ProjectListItem } from "@/lib/data/projects";
import { normalizeInternalLink, resolveHomepageImage } from "@/lib/homepage-proof";
import { prisma } from "@/lib/prisma";

export type ShowcaseItem = {
  id: number;
  title: string;
  desc: string;
  image: string;
  link: string;
};

export type HomepageData = {
  projects: ProjectListItem[];
  publishedProjectCount: number | null;
  products: ShowcaseItem[];
};

async function getShowcaseProducts(): Promise<ShowcaseItem[]> {
  "use cache";
  cacheTag("showcase-products");
  cacheLife("hours");

  const records = await prisma.showcase_products.findMany({
    orderBy: { order: "asc" },
    take: 4,
    select: { id: true, title: true, description: true, image: true, link: true },
  });

  return records.flatMap((record) => {
    const image = resolveHomepageImage(record.image, process.env.LIARA_BUCKET_URL);
    return image
      ? [
          {
            id: record.id,
            title: record.title,
            desc: record.description,
            image,
            link: normalizeInternalLink(record.link),
          },
        ]
      : [];
  });
}

export async function getHomepageData(): Promise<HomepageData> {
  const [projectResult, productResult] = await Promise.allSettled([
    getProjects(),
    getShowcaseProducts(),
  ]);

  const published = projectResult.status === "fulfilled" ? projectResult.value : null;
  const projects = (published ?? [])
    .flatMap((project) => {
      const image = resolveHomepageImage(project.mainImg, process.env.LIARA_BUCKET_URL);
      return image ? [{ ...project, mainImg: image }] : [];
    })
    .slice(0, 3);

  return {
    projects,
    publishedProjectCount: published ? published.length : null,
    products: productResult.status === "fulfilled" ? productResult.value : [],
  };
}
