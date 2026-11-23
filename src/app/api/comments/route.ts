import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import {
  actorIdFromAuth,
  commentErrorResponse,
  forbiddenOriginResponse,
  hasAllowedOrigin,
  invalidRequestResponse,
  noStoreHeaders,
  withNoStore,
} from "@/lib/comments/http";
import { submitComment } from "@/lib/comments/service";
import { commentSubmissionSchema, readCommentJson } from "@/lib/comments/validation";

export async function POST(request: Request) {
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

  try {
    const input = commentSubmissionSchema.safeParse(await readCommentJson(request));
    if (!input.success) return invalidRequestResponse("The comment fields are invalid.", true);

    const result = await submitComment(input.data, actorId);
    return NextResponse.json(result, { status: 202, headers: noStoreHeaders });
  } catch (error) {
    return commentErrorResponse(error, true);
  }
}
