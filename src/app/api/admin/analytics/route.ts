import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/authMiddleware";
import { getAnalyticsService, getTapService } from "@/lib/container";
import { calculateProgress } from "@/domain/models/WeeklyGoal";
import type { Horizon } from "@/domain/services/AnalyticsService";

const VALID_HORIZONS: Horizon[] = ["24h", "7d", "30d"];

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const horizon = (request.nextUrl.searchParams.get("horizon") ?? "7d") as Horizon;
  if (!VALID_HORIZONS.includes(horizon)) {
    return NextResponse.json(
      { error: "Invalid horizon. Must be one of: 24h, 7d, 30d" },
      { status: 400 }
    );
  }

  try {
    const analyticsService = getAnalyticsService();
    const tapService = getTapService();

    const [frequencyData, weeklyCount, totalTaps] = await Promise.all([
      analyticsService.getFrequencyData(horizon),
      tapService.getWeeklyCount(),
      analyticsService.getTotalTapCount(),
    ]);

    const goal = Number(process.env.WEEKLY_TAP_GOAL) || 50;
    const progress = calculateProgress(weeklyCount, goal);

    return NextResponse.json({
      frequency: frequencyData,
      summary: {
        totalTaps,
        weeklyCount,
        goal,
        progress,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
