import type { LoveTap } from "@/domain/models/LoveTap";
import type { TapRepository } from "@/ports/TapRepository";
import type { RealtimeGateway } from "@/ports/RealtimeGateway";
import type { CachePort } from "@/ports/CachePort";

function getWeekKey(): string {
  const now = new Date();
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear) / 86400000);
  const startDay = new Date(startOfYear).getUTCDay();
  const weekNumber = Math.ceil((dayOfYear + startDay + 1) / 7);
  const key = `weekly_taps:${now.getUTCFullYear()}:w${weekNumber}`;
  console.log("[TapService] weekKey =", key);
  return key;
}

function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
  return monday;
}

export class TapService {
  constructor(
    private readonly tapRepository: TapRepository,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly cache: CachePort
  ) {}

  async recordTap(count: number = 1, userId?: string, color?: string): Promise<{ tap: LoveTap; weeklyCount: number }> {
    const weekKey = getWeekKey();

    const [tap, weeklyCount] = await Promise.all([
      this.tapRepository.recordTap({
        timestamp: new Date(),
        userId,
        count,
      }),
      count === 1
        ? this.cache.incrementWeeklyCounter(weekKey)
        : this.cache.incrementWeeklyCounterBy(weekKey, count),
    ]);

    this.realtimeGateway.broadcastTap({
      id: tap.id,
      timestamp: tap.timestamp.toISOString(),
      count,
      color,
    });

    return { tap, weeklyCount };
  }

  async getWeeklyCount(): Promise<number> {
    const weekKey = getWeekKey();
    const cached = await this.cache.getWeeklyCounter(weekKey);

    if (cached > 0) return cached;

    const startOfWeek = getStartOfWeek();
    const count = await this.tapRepository.getWeeklyCount(startOfWeek);

    if (count > 0) {
      const secondsUntilEndOfWeek = this.getSecondsUntilEndOfWeek();
      await this.cache.setWeeklyCounter(weekKey, count, secondsUntilEndOfWeek);
    }

    return count;
  }

  private getSecondsUntilEndOfWeek(): number {
    const now = new Date();
    const endOfWeek = new Date(now);
    const day = endOfWeek.getDay();
    const daysUntilSunday = day === 0 ? 0 : 7 - day;
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);
    return Math.ceil((endOfWeek.getTime() - now.getTime()) / 1000);
  }
}
