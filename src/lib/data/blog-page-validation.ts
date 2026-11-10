import { prisma } from "@/lib/prisma";

export async function hasBlogCategoryPage(categorySlug: string): Promise<boolean> {
  if (!categorySlug.trim()) return false;

  const count = await prisma.blogs.count({
    where: {
      status: "Published",
      QrCode_key: null,
      BlogCategories: {
        some: {
          Categories: {
            slug: categorySlug,
          },
        },
      },
    },
  });

  return count > 0;
}
