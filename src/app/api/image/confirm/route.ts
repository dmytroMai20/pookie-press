import { NextRequest, NextResponse } from "next/server";
import { getImageService } from "@/lib/container";

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

    const imageService = getImageService();
    const result = await imageService.confirmUpload({
      s3Key,
      contentType: "image/jpeg",
      sizeBytes: typeof sizeBytes === "number" ? sizeBytes : 0,
    });

    return NextResponse.json(
      {
        success: true,
        imageId: result.imageId,
        url: result.url,
        timestamp: result.timestamp,
      },
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
