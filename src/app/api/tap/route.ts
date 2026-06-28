import { NextRequest, NextResponse } from "next/server";
import { getTapService } from "@/lib/container";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";

    const body = await request.json().catch(() => ({}));
    const count = Math.min(Math.max(Math.floor(Number(body.count) || 1), 1), 50);
    const color = typeof body.color === "string" ? body.color.slice(0, 9) : undefined;

    const { allowed, remaining } = await rateLimit(ip, 120, 60);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        {
          status: 429,
          headers: { "X-RateLimit-Remaining": String(remaining) },
        }
      );
    }

    const tapService = getTapService();
    const { tap, weeklyCount } = await tapService.recordTap(count, undefined, color);

    return NextResponse.json(
      { success: true, tap: { id: tap.id, timestamp: tap.timestamp.toISOString() }, count, weeklyCount },
      { status: 201, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("Error recording tap:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record tap" },
      { status: 500 }
    );
  }
}
