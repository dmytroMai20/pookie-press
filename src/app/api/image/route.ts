import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getImageService } from "@/lib/container";
import { getConfig } from "@/lib/config";
import { rateLimit } from "@/lib/rateLimit";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_DIMENSION = 1080;
const JPEG_QUALITY = 80;

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

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid image type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    const config = getConfig();
    const maxBytes = config.IMAGE_MAX_SIZE_MB * 1024 * 1024;

    if (file.size > maxBytes) {
      return NextResponse.json(
        { success: false, error: `Image exceeds ${config.IMAGE_MAX_SIZE_MB}MB limit` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    const processed = await sharp(rawBuffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    if (processed.length > maxBytes) {
      return NextResponse.json(
        { success: false, error: "Processed image still exceeds size limit" },
        { status: 400 }
      );
    }

    const imageService = getImageService();
    const snap = await imageService.processAndBroadcast({
      buffer: processed,
      contentType: "image/jpeg",
      sizeBytes: processed.length,
      displaySeconds: config.IMAGE_DISPLAY_SECONDS,
    });

    return NextResponse.json(
      { success: true, imageId: snap.id },
      { status: 201, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    const detail = process.env.NODE_ENV === "development" && error instanceof Error
      ? `: ${error.message}`
      : "";
    return NextResponse.json(
      { success: false, error: `Failed to upload image${detail}` },
      { status: 500 }
    );
  }
}
