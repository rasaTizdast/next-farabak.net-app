import type { Categories } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/prisma";

import { TAGS } from "./tags";

// /api/blogs/getCategories
async function queryBlogCategories(): Promise<Categories[]> {
  const categories = await prisma.categories.findMany();

  return categories;
}

export async function getBlogCategories(): Promise<Categories[]> {
  "use cache";
  cacheTag(TAGS.blogs);
  cacheLife("minutes");

  return queryBlogCategories();
}
