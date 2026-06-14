import { NextRequest, NextResponse } from "next/server";
import { getImageService } from "@/lib/container";
import { getConfig } from "@/lib/config";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { allowed, remaining } = await rateLimit(`img:${ip}`, 5, 60);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many image uploads" },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const config = getConfig();
    const maxBytes = config.IMAGE_MAX_SIZE_MB * 1024 * 1024;

    const imageService = getImageService();
    const { uploadUrl, s3Key } = await imageService.createUploadUrl(
      "image/jpeg",
      maxBytes
    );

    return NextResponse.json(
      { success: true, uploadUrl, s3Key },
      { status: 200, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("Error creating presigned URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
}
