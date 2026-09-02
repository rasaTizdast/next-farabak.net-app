import type { Categories } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { cachedQuery } from "./cache";
import { TAGS } from "./tags";

// /api/blogs/getCategories
async function queryBlogCategories(): Promise<Categories[]> {
  const categories = await prisma.categories.findMany();

  return categories;
}

export const getBlogCategories = cachedQuery("getBlogCategories", queryBlogCategories, {
  revalidate: 60,
  tags: [TAGS.blogs],
});
