import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import {
  actorIdFromAuth,
  commentErrorResponse,
  forbiddenOriginResponse,
  hasAllowedOrigin,
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
    if (!input.success) {
      const fields: { body?: string; alias?: string } = {};
      for (const issue of input.error.issues) {
        const field = issue.path[0];
        if (field === "body") fields.body = "متن دیدگاه باید بین ۱۰ تا ۲۰۰۰ نویسه باشد.";
        if (field === "alias") fields.alias = "نام مستعار باید بین ۲ تا ۸۰ نویسه باشد.";
      }
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "The comment fields are invalid.",
            ...(Object.keys(fields).length > 0 ? { fields } : {}),
          },
        },
        { status: 400, headers: noStoreHeaders }
      );
    }

    const result = await submitComment(input.data, actorId);
    return NextResponse.json(result, { status: 202, headers: noStoreHeaders });
  } catch (error) {
    return commentErrorResponse(error, true);
  }
}
