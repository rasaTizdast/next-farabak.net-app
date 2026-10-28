import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { createVideoUploadUrl } from "@/lib/s3/createVideoUploadUrl";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (auth.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    return await createVideoUploadUrl(request, "blogVideos");
  } catch (error) {
    console.error("Failed to create blog video upload URL:", error);
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
  }
}
