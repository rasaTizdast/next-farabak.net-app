import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth";
import { listAdminComments } from "@/lib/comments/admin-queries";
import {
  actorIdFromAuth,
  commentErrorResponse,
  invalidRequestResponse,
  noStoreHeaders,
  routeId,
  withNoStore,
} from "@/lib/comments/http";

const filterSchema = z.strictObject({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  targetType: z.enum(["blog", "product"]).optional(),
  cursor: z.number().int().positive().optional(),
});

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return withNoStore(auth);

  const actorId = actorIdFromAuth(auth);
  if (actorId === null) {
    return NextResponse.json(
      { error: { code: "ACCOUNT_NOT_FOUND", message: "Sign in to continue." } },
      { status: 401, headers: noStoreHeaders }
    );
  }

  const url = new URL(request.url);
  const values: Record<string, string> = {};
  for (const key of url.searchParams.keys()) {
    if (!new Set(["status", "targetType", "cursor"]).has(key)) {
      return invalidRequestResponse("The admin comment filters are invalid.", true);
    }
    const matches = url.searchParams.getAll(key);
    if (matches.length !== 1) {
      return invalidRequestResponse("The admin comment filters are invalid.", true);
    }
    values[key] = matches[0];
  }

  if (values.cursor !== undefined) {
    const parsedCursor = routeId(values.cursor);
    if (parsedCursor === null) return invalidRequestResponse("The admin cursor is invalid.", true);
    values.cursor = String(parsedCursor);
  }

  const filters = filterSchema.safeParse({
    ...(values.status === undefined ? {} : { status: values.status }),
    ...(values.targetType === undefined ? {} : { targetType: values.targetType }),
    ...(values.cursor === undefined ? {} : { cursor: Number(values.cursor) }),
  });
  if (!filters.success)
    return invalidRequestResponse("The admin comment filters are invalid.", true);

  try {
    return NextResponse.json(await listAdminComments(actorId, filters.data), {
      headers: noStoreHeaders,
    });
  } catch (error) {
    return commentErrorResponse(error, true);
  }
}
