import { NextRequest, NextResponse } from "next/server";
import { getImageService } from "@/lib/container";
import { getConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { s3Key, sizeBytes } = body;

    if (!s3Key || typeof s3Key !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing s3Key" },
        { status: 400 }
      );
    }

    if (!s3Key.startsWith("images/")) {
      return NextResponse.json(
        { success: false, error: "Invalid s3Key" },
        { status: 400 }
      );
    }

    const config = getConfig();

    const imageService = getImageService();
    const snap = await imageService.confirmAndBroadcast({
      s3Key,
      contentType: "image/jpeg",
      sizeBytes: typeof sizeBytes === "number" ? sizeBytes : 0,
      displaySeconds: config.IMAGE_DISPLAY_SECONDS,
    });

    return NextResponse.json(
      { success: true, imageId: snap.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error confirming image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm image" },
      { status: 500 }
    );
  }
}
