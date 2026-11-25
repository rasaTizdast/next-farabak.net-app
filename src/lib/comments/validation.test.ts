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
  it("accepts the maximum body and alias together when both use four-byte Unicode", async () => {
    const payload = {
      target: { type: "blog", id: 7 },
      mode: "alias",
      body: "🙂".repeat(2000),
      alias: "🙂".repeat(80),
    };
    const request = new Request("https://farabak.net/api/comments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await expect(readCommentJson(request)).resolves.toEqual(payload);
  });

  it("accepts a JSON body of exactly 16 KiB", async () => {
    const payload = `"${"a".repeat(16 * 1024 - 2)}"`;
    const request = new Request("https://farabak.net/api/comments", {
      method: "POST",
      body: payload,
    });
    await expect(readCommentJson(request)).resolves.toBe("a".repeat(16 * 1024 - 2));
  });

  it("rejects an oversized declared body before consuming it", async () => {
    const request = new Request("https://farabak.net/api/comments", {
      method: "POST",
      body: "{}",
      headers: { "content-length": "16385" },
    });
    await expect(readCommentJson(request)).rejects.toMatchObject({ status: 413 });
    expect(request.bodyUsed).toBe(false);
  });

  it("rejects the actual UTF-8 byte count when the header understates it", async () => {
    const request = new Request("https://farabak.net/api/comments", {
      method: "POST",
      body: `"${"a".repeat(16 * 1024 - 1)}"`,
      headers: { "content-length": "100" },
    });
    await expect(readCommentJson(request)).rejects.toMatchObject({ status: 413 });
  });

  it("distinguishes malformed JSON from an oversized payload", async () => {
    const request = new Request("https://farabak.net/api/comments", { method: "POST", body: "{" });
    await expect(readCommentJson(request)).rejects.toMatchObject({ status: 400 });
  });
});
