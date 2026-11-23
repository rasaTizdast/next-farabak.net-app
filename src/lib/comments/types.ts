import type { CommentPresentation } from "@prisma/client";
import type { z } from "zod";

import type { commentSubmissionSchema } from "./validation";

export type CommentTarget = { type: "blog" | "product"; id: number };

export type CommentSubmission = z.infer<typeof commentSubmissionSchema>;

export type CommentDecision = "APPROVED" | "REJECTED";

export type PublicCommentReply = {
  id: number;
  displayName: string;
  body: string;
  presentation: CommentPresentation;
  publishedAt: string | null;
};

export type PublicCommentItem = PublicCommentReply & { replies: PublicCommentReply[] };

export type PublicCommentPage = {
  comments: PublicCommentItem[];
  nextCursor: number | null;
};

export class CommentError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "CommentError";
  }
}
