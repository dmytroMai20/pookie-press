import { NextResponse } from "next/server";
import { getTapService } from "@/lib/container";
import { calculateProgress } from "@/domain/models/WeeklyGoal";

export async function GET() {
  try {
    const tapService = getTapService();
    const weeklyCount = await tapService.getWeeklyCount();
    const goal = Number(process.env.WEEKLY_TAP_GOAL) || 50;
    const progress = calculateProgress(weeklyCount, goal);

    return NextResponse.json({
      weeklyCount,
      goal,
      progress,
      isComplete: weeklyCount >= goal,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
