import { NextRequest, NextResponse } from "next/server";

import { buildNotFoundMarkdown, markdownPages } from "@/lib/markdownContent";

const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await params;
  const key = slug.join("/");

  const page = markdownPages[key];

  if (!page) {
    const pathname = "/" + key;
    return new NextResponse(buildNotFoundMarkdown(pathname), {
      status: 404,
      headers: {
        "Content-Type": MARKDOWN_CONTENT_TYPE,
        Vary: "Accept, Accept-Encoding",
      },
    });
  }

  return new NextResponse(page.markdown, {
    status: 200,
    headers: {
      "Content-Type": MARKDOWN_CONTENT_TYPE,
      Vary: "Accept, Accept-Encoding",
      "X-Robots-Tag": "noindex",
    },
  });
}
