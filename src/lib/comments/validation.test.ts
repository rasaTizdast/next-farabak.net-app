// @vitest-environment node

import { describe, expect, it } from "vitest";

import { commentSubmissionSchema, readCommentJson } from "./validation";

const memberSubmission = { target: { type: "blog", id: 7 }, mode: "member" };

describe("comment text validation", () => {
  it.each(["  123456789  ", "آ".repeat(2001), "Course notes\u0000 with a null byte"])(
    "rejects an invalid body",
    (body) => {
      expect(commentSubmissionSchema.safeParse({ ...memberSubmission, body }).success).toBe(false);
    }
  );

  it.each(["آ".repeat(10), "🙂".repeat(2000), "متن کامل برای آزمون\n<script> https://example.com"])(
    "trims valid Unicode plain text and preserves its content",
    (body) => {
      expect(commentSubmissionSchema.parse({ ...memberSubmission, body: `  ${body}  ` }).body).toBe(
        body
      );
    }
  );

  it.each([" ا ", "ا".repeat(81)])("rejects aliases outside the trimmed length limits", (alias) => {
    const result = commentSubmissionSchema.safeParse({
      ...memberSubmission,
      mode: "alias",
      alias,
      body: "متن کامل برای آزمون",
    });
    expect(result.success).toBe(false);
  });
});

describe("readCommentJson", () => {
  it("accepts a body of exactly 8 KiB", async () => {
    const payload = "آ".repeat(4095);
    const request = new Request("https://farabak.net/api/comments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await expect(readCommentJson(request)).resolves.toBe(payload);
  });

  it("rejects an oversized declared body before consuming it", async () => {
    const request = new Request("https://farabak.net/api/comments", {
      method: "POST",
      body: "{}",
      headers: { "content-length": "8193" },
    });
    await expect(readCommentJson(request)).rejects.toMatchObject({ status: 413 });
    expect(request.bodyUsed).toBe(false);
  });

  it("rejects the actual UTF-8 byte count when the header understates it", async () => {
    const request = new Request("https://farabak.net/api/comments", {
      method: "POST",
      body: JSON.stringify("آ".repeat(4096)),
      headers: { "content-length": "100" },
    });
    await expect(readCommentJson(request)).rejects.toMatchObject({ status: 413 });
  });

  it("distinguishes malformed JSON from an oversized payload", async () => {
    const request = new Request("https://farabak.net/api/comments", { method: "POST", body: "{" });
    await expect(readCommentJson(request)).rejects.toMatchObject({ status: 400 });
  });
});
