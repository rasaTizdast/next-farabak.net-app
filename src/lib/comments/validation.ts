import { z } from "zod";

import { CommentError } from "./types";

const maxJsonBytes = 16 * 1024;

function plainText(min: number, max: number) {
  return z
    .string()
    .trim()
    .refine((text) => {
      const length = Array.from(text).length;
      return length >= min && length <= max && !text.includes("\0");
    });
}

export const commentIdSchema = z.int32().positive();
export const commentTargetSchema = z.strictObject({
  type: z.enum(["blog", "product"]),
  id: commentIdSchema,
});

const submissionFields = { target: commentTargetSchema, body: plainText(10, 2000) };

export const commentSubmissionSchema = z.discriminatedUnion("mode", [
  z.strictObject({ ...submissionFields, mode: z.literal("member") }),
  z.strictObject({ ...submissionFields, mode: z.literal("alias"), alias: plainText(2, 80) }),
  z.strictObject({ ...submissionFields, mode: z.literal("editorial"), parentId: commentIdSchema }),
]);

export const commentModerationSchema = z.strictObject({
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: plainText(0, 1000).optional(),
});

export async function readCommentJson(request: Request): Promise<unknown> {
  const tooLarge = new CommentError(
    413,
    "BODY_TOO_LARGE",
    "Comment requests are limited to 16 KiB."
  );
  if (Number(request.headers.get("content-length")) > maxJsonBytes) throw tooLarge;

  const malformed = new CommentError(400, "INVALID_JSON", "The request body must be valid JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw malformed;

  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let json = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      bytes += value.byteLength;
      if (bytes > maxJsonBytes) {
        void reader.cancel().catch(() => {});
        throw tooLarge;
      }
      json += decoder.decode(value, { stream: true });
    }
    return JSON.parse(json + decoder.decode());
  } catch (error) {
    if (error === tooLarge) throw tooLarge;
    throw malformed;
  } finally {
    reader.releaseLock();
  }
}
