import { NextResponse } from "next/server";

import {
  contactSubmissionSchema,
  MAX_CONTACT_SUBMISSION_BODY_BYTES,
} from "@/lib/contact-submissions";
import { prisma } from "@/lib/prisma";

const noStoreHeaders = { "Cache-Control": "no-store" };

function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

async function readBoundedBody(request: Request): Promise<string | "too-large"> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_CONTACT_SUBMISSION_BODY_BYTES) {
    return "too-large";
  }

  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_CONTACT_SUBMISSION_BODY_BYTES) {
      await reader.cancel();
      return "too-large";
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(body);
}

export async function POST(request: Request) {
  let requestBody: string | "too-large";
  try {
    requestBody = await readBoundedBody(request);
  } catch {
    return jsonResponse({ ok: false, message: "درخواست معتبر نیست." }, 400);
  }

  if (requestBody === "too-large") {
    return jsonResponse({ ok: false, message: "حجم درخواست بیش از حد مجاز است." }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(requestBody);
  } catch {
    return jsonResponse({ ok: false, message: "متن درخواست معتبر نیست." }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonResponse({ ok: false, message: "اطلاعات واردشده معتبر نیست." }, 400);
  }

  const rawBody = body as Record<string, unknown>;
  if (typeof rawBody.website === "string" && rawBody.website.trim() !== "") {
    return jsonResponse({ ok: true }, 201);
  }

  const validation = contactSubmissionSchema.safeParse(rawBody);
  if (!validation.success) {
    return jsonResponse({ ok: false, message: "اطلاعات واردشده معتبر نیست." }, 400);
  }

  try {
    const { name, phone, project, message } = validation.data;
    await prisma.contactSubmission.create({
      data: {
        name,
        phone,
        project: project || null,
        message,
      },
    });

    return jsonResponse({ ok: true }, 201);
  } catch (error) {
    console.error("Failed to save contact submission", {
      errorType: error instanceof Error ? error.name : "UnknownError",
    });
    return jsonResponse(
      { ok: false, message: "در ثبت پیام خطایی رخ داد. لطفاً دوباره تلاش کنید." },
      500
    );
  }
}
