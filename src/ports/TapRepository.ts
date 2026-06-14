import type { LoveTap } from "@/domain/models/LoveTap";

export interface TapRepository {
  recordTap(tap: Omit<LoveTap, "id">): Promise<LoveTap>;
  getWeeklyCount(since: Date): Promise<number>;
  getTapsInRange(start: Date, end: Date): Promise<LoveTap[]>;
}
