import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;
const noStoreHeaders = { "Cache-Control": "no-store" };

function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) {
    auth.headers.set("Cache-Control", "no-store");
    return auth;
  }
  if (auth.role?.toLowerCase() !== "admin") {
    return jsonResponse({ error: "دسترسی غیرمجاز" }, 403);
  }

  const url = new URL(request.url);
  const cursorValues = url.searchParams.getAll("cursor");
  if (cursorValues.length > 1) {
    return jsonResponse({ error: "شناسه صفحه معتبر نیست." }, 400);
  }

  const cursorValue = cursorValues[0];
  let cursor: number | undefined;
  if (cursorValue !== undefined) {
    if (!/^[1-9]\d*$/.test(cursorValue)) {
      return jsonResponse({ error: "شناسه صفحه معتبر نیست." }, 400);
    }
    cursor = Number(cursorValue);
    if (!Number.isSafeInteger(cursor)) {
      return jsonResponse({ error: "شناسه صفحه معتبر نیست." }, 400);
    }
  }

  try {
    const rows = await prisma.contactSubmission.findMany({
      where: cursor ? { id: { lt: cursor } } : undefined,
      orderBy: { id: "desc" },
      take: PAGE_SIZE + 1,
      select: {
        id: true,
        name: true,
        phone: true,
        project: true,
        message: true,
        createdAt: true,
      },
    });

    const items = rows.slice(0, PAGE_SIZE);
    return jsonResponse(
      {
        items,
        nextCursor: rows.length > PAGE_SIZE ? (items[items.length - 1]?.id ?? null) : null,
      },
      200
    );
  } catch (error) {
    console.error("Failed to load contact submissions", {
      errorType: error instanceof Error ? error.name : "UnknownError",
    });
    return jsonResponse({ error: "خطا در دریافت پیام‌ها." }, 500);
  }
}
