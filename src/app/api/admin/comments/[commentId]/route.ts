import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import {
  actorIdFromAuth,
  commentErrorResponse,
  forbiddenOriginResponse,
  hasAllowedOrigin,
  invalidRequestResponse,
  noStoreHeaders,
  routeId,
  withNoStore,
} from "@/lib/comments/http";
import { moderateComment } from "@/lib/comments/service";
import { commentModerationSchema, readCommentJson } from "@/lib/comments/validation";

type RouteContext = { params: Promise<{ commentId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!hasAllowedOrigin(request)) return forbiddenOriginResponse();

  const auth = await requireAuth();
  if (auth instanceof NextResponse) return withNoStore(auth);

  const actorId = actorIdFromAuth(auth);
  if (actorId === null) {
    return NextResponse.json(
      { error: { code: "ACCOUNT_NOT_FOUND", message: "Sign in to continue." } },
      { status: 401, headers: noStoreHeaders }
    );
  }

  const { commentId: rawCommentId } = await context.params;
  const commentId = routeId(rawCommentId);
  if (commentId === null) return invalidRequestResponse("The comment ID is invalid.", true);

  try {
    const decision = commentModerationSchema.safeParse(await readCommentJson(request));
    if (!decision.success) {
      return invalidRequestResponse("The moderation fields are invalid.", true);
    }

    await moderateComment(commentId, decision.data.decision, actorId, decision.data.note);
    return NextResponse.json(
      { id: commentId, status: decision.data.decision },
      { headers: noStoreHeaders }
    );
  } catch (error) {
    return commentErrorResponse(error, true);
  }
}
