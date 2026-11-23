import { NextResponse } from "next/server";

import { commentErrorResponse, invalidRequestResponse, routeId } from "@/lib/comments/http";
import { listApprovedComments } from "@/lib/comments/queries";
import { commentIdSchema, commentTargetSchema } from "@/lib/comments/validation";

type RouteContext = { params: Promise<{ targetType: string; targetId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { targetType, targetId: rawTargetId } = await context.params;
  const targetId = routeId(rawTargetId);
  const target = commentTargetSchema.safeParse({ type: targetType, id: targetId });
  if (!target.success) return invalidRequestResponse("The comment target is invalid.");

  const url = new URL(request.url);
  if ([...url.searchParams.keys()].some((key) => key !== "cursor")) {
    return invalidRequestResponse("The comment query fields are invalid.");
  }
  const cursors = url.searchParams.getAll("cursor");
  if (cursors.length > 1) return invalidRequestResponse("The comment cursor is invalid.");

  let cursor: number | undefined;
  if (cursors.length === 1) {
    const rawCursor = cursors[0];
    const parsedCursor = routeId(rawCursor);
    if (parsedCursor === null || !commentIdSchema.safeParse(parsedCursor).success) {
      return invalidRequestResponse("The comment cursor is invalid.");
    }
    cursor = parsedCursor;
  }

  try {
    return NextResponse.json(await listApprovedComments(target.data, cursor));
  } catch (error) {
    return commentErrorResponse(error);
  }
}
