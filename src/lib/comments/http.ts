import { NextResponse } from "next/server";

import { SITE_URL } from "@/constants/meta";
import type { AuthUser } from "@/lib/auth";

import { CommentError } from "./types";
import { commentIdSchema } from "./validation";

export const noStoreHeaders = { "Cache-Control": "no-store" };

export function withNoStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function commentErrorResponse(error: unknown, noStore = false): NextResponse {
  const headers = noStore ? noStoreHeaders : undefined;
  if (error instanceof CommentError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status, headers }
    );
  }

  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "The comment request could not be completed." } },
    { status: 500, headers }
  );
}

export function invalidRequestResponse(
  message = "The request fields are invalid.",
  noStore = false
) {
  return NextResponse.json(
    { error: { code: "INVALID_REQUEST", message } },
    { status: 400, headers: noStore ? noStoreHeaders : undefined }
  );
}

export function forbiddenOriginResponse(): NextResponse {
  return NextResponse.json(
    { error: { code: "ORIGIN_FORBIDDEN", message: "This request origin is not allowed." } },
    { status: 403, headers: noStoreHeaders }
  );
}

function configuredOrigin(): string | null {
  const configured = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || SITE_URL;
  try {
    const url = new URL(configured);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function hasAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    if ((parsed.protocol !== "https:" && parsed.protocol !== "http:") || parsed.origin !== origin) {
      return false;
    }
    return origin === configuredOrigin();
  } catch {
    return false;
  }
}

export function actorIdFromAuth(user: AuthUser): number | null {
  const raw = user.userId;
  if (typeof raw !== "number" && (typeof raw !== "string" || !/^\d+$/.test(raw))) return null;
  const parsed = commentIdSchema.safeParse(Number(raw));
  return parsed.success ? parsed.data : null;
}

export function routeId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const parsed = commentIdSchema.safeParse(Number(raw));
  return parsed.success ? parsed.data : null;
}
