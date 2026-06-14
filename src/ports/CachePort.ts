export interface CachePort {
  incrementWeeklyCounter(weekKey: string): Promise<number>;
  incrementWeeklyCounterBy(weekKey: string, count: number): Promise<number>;
  getWeeklyCounter(weekKey: string): Promise<number>;
  setWeeklyCounter(weekKey: string, value: number, ttlSeconds: number): Promise<void>;
}
