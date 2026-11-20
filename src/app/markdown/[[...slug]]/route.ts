import { NextRequest, NextResponse } from "next/server";

import { SITE_URL } from "@/constants/meta";
import { getCatalogMarkdown } from "@/lib/catalogMarkdown";
import {
  buildNotFoundMarkdown,
  getCatalogPageCheck,
  getStaticMarkdownPage,
} from "@/lib/markdownContent";

const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await params;
  const key = slug.join("/");

  const catalogPage = getCatalogPageCheck(slug, request.nextUrl.searchParams);
  const page =
    catalogPage && catalogPage !== "not-found"
      ? await getCatalogMarkdown(catalogPage)
      : getStaticMarkdownPage(key);

  if (!page) {
    const pathname = "/" + slug.map(encodeURIComponent).join("/");
    return new NextResponse(buildNotFoundMarkdown(pathname), {
      status: 404,
      headers: {
        "Content-Type": MARKDOWN_CONTENT_TYPE,
        Vary: "Accept, Accept-Encoding",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  return new NextResponse(page.markdown, {
    status: 200,
    headers: {
      "Content-Type": MARKDOWN_CONTENT_TYPE,
      Vary: "Accept, Accept-Encoding",
      Link: `<${new URL(page.path, SITE_URL)}>; rel="canonical"`,
    },
  });
}
