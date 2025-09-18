import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// DB-backed endpoint to fetch category/subcategory blog content.
// Paginated routes should receive the same content as their base route.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("categorySlug");
  const subcategorySlug = searchParams.get("subcategorySlug");
  const _page = searchParams.get("page");

  if (!categorySlug && !subcategorySlug) {
    return NextResponse.json({ topBlog: null, bottomBlog: null });
  }

  try {
    if (subcategorySlug) {
      const sub = (await prisma.categoryContent.findFirst({
        where: { Slug: subcategorySlug },
      })) as unknown as { TopBlog?: string | null; BottomBlog?: string | null } | null;
      return NextResponse.json({
        topBlog: sub?.TopBlog || null,
        bottomBlog: sub?.BottomBlog || null,
      });
    }

    if (categorySlug) {
      const cat = (await prisma.category.findFirst({
        where: { Slug: categorySlug },
      })) as unknown as { TopBlog?: string | null; BottomBlog?: string | null } | null;
      return NextResponse.json({
        topBlog: cat?.TopBlog || null,
        bottomBlog: cat?.BottomBlog || null,
      });
    }

    return NextResponse.json({ topBlog: null, bottomBlog: null });
  } catch (error) {
    console.error("blogs API error", error);
    return NextResponse.json({ topBlog: null, bottomBlog: null }, { status: 500 });
  }
}
