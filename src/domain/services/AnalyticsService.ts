import type { TapRepository } from "@/ports/TapRepository";
import type { LoveTap } from "@/domain/models/LoveTap";

export type Horizon = "24h" | "7d" | "30d";

export interface FrequencyBucket {
  label: string;
  count: number;
}

export interface AnalyticsData {
  buckets: FrequencyBucket[];
  totalTaps: number;
  peakLabel: string;
}

export class AnalyticsService {
  constructor(private readonly tapRepository: TapRepository) {}

  async getFrequencyData(horizon: Horizon): Promise<AnalyticsData> {
    const now = new Date();
    const start = this.getStartDate(horizon, now);
    const taps = await this.tapRepository.getTapsInRange(start, now);

    const buckets = this.aggregate(taps, horizon, start, now);
    const totalTaps = taps.reduce((sum, t) => sum + t.count, 0);
    const peakLabel = this.findPeakLabel(buckets);

    return { buckets, totalTaps, peakLabel };
  }

  async getTotalTapCount(): Promise<number> {
    const allTime = new Date(0);
    const now = new Date();
    const taps = await this.tapRepository.getTapsInRange(allTime, now);
    return taps.reduce((sum, t) => sum + t.count, 0);
  }

  private getStartDate(horizon: Horizon, now: Date): Date {
    const start = new Date(now);
    switch (horizon) {
      case "24h":
        start.setHours(start.getHours() - 24);
        break;
      case "7d":
        start.setDate(start.getDate() - 7);
        break;
      case "30d":
        start.setDate(start.getDate() - 30);
        break;
    }
    return start;
  }

  private aggregate(
    taps: LoveTap[],
    horizon: Horizon,
    start: Date,
    end: Date
  ): FrequencyBucket[] {
    switch (horizon) {
      case "24h":
        return this.aggregateHourly(taps, start, end);
      case "7d":
        return this.aggregateDaily(taps, start, end);
      case "30d":
        return this.aggregateDaily(taps, start, end);
    }
  }

  private aggregateHourly(
    taps: LoveTap[],
    start: Date,
    end: Date
  ): FrequencyBucket[] {
    const buckets: FrequencyBucket[] = [];
    const cursor = new Date(start);
    cursor.setMinutes(0, 0, 0);

    while (cursor < end) {
      const bucketEnd = new Date(cursor);
      bucketEnd.setHours(bucketEnd.getHours() + 1);

      const label = cursor.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const count = taps
        .filter((t) => t.timestamp >= cursor && t.timestamp < bucketEnd)
        .reduce((sum, t) => sum + t.count, 0);

      buckets.push({ label, count });
      cursor.setHours(cursor.getHours() + 1);
    }

    return buckets;
  }

  private aggregateDaily(
    taps: LoveTap[],
    start: Date,
    end: Date
  ): FrequencyBucket[] {
    const buckets: FrequencyBucket[] = [];
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);

    while (cursor < end) {
      const bucketEnd = new Date(cursor);
      bucketEnd.setDate(bucketEnd.getDate() + 1);

      const label = cursor.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const count = taps
        .filter((t) => t.timestamp >= cursor && t.timestamp < bucketEnd)
        .reduce((sum, t) => sum + t.count, 0);

      buckets.push({ label, count });
      cursor.setDate(cursor.getDate() + 1);
    }

    return buckets;
  }

  private findPeakLabel(buckets: FrequencyBucket[]): string {
    if (buckets.length === 0) return "N/A";
    const peak = buckets.reduce((max, b) => (b.count > max.count ? b : max), buckets[0]);
    return peak.count > 0 ? peak.label : "N/A";
  }
}
