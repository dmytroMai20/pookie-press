import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnalyticsService } from "@/domain/services/AnalyticsService";
import type { TapRepository } from "@/ports/TapRepository";
import type { LoveTap } from "@/domain/models/LoveTap";

function createMockRepository(): TapRepository {
  return {
    recordTap: vi.fn(),
    getWeeklyCount: vi.fn(),
    getTapsInRange: vi.fn().mockResolvedValue([]),
  };
}

function makeTap(timestamp: Date, count: number = 1): LoveTap {
  return { id: crypto.randomUUID(), timestamp, count };
}

describe("AnalyticsService", () => {
  let service: AnalyticsService;
  let mockRepo: TapRepository;

  beforeEach(() => {
    mockRepo = createMockRepository();
    service = new AnalyticsService(mockRepo);
  });

  describe("getFrequencyData", () => {
    it("returns empty buckets when no taps exist", async () => {
      const result = await service.getFrequencyData("7d");
      expect(result.totalTaps).toBe(0);
      expect(result.peakLabel).toBe("N/A");
      expect(result.buckets.length).toBeGreaterThan(0);
      expect(result.buckets.every((b) => b.count === 0)).toBe(true);
    });

    it("aggregates hourly buckets for 24h horizon", async () => {
      const now = new Date();
      const twoHoursAgo = new Date(now);
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

      const taps: LoveTap[] = [
        makeTap(twoHoursAgo),
        makeTap(twoHoursAgo),
        makeTap(new Date(now.getTime() - 30 * 60 * 1000)),
      ];

      (mockRepo.getTapsInRange as ReturnType<typeof vi.fn>).mockResolvedValue(taps);

      const result = await service.getFrequencyData("24h");
      expect(result.totalTaps).toBe(3);
      expect(result.buckets.length).toBeGreaterThanOrEqual(24);

      const nonZero = result.buckets.filter((b) => b.count > 0);
      expect(nonZero.length).toBeGreaterThan(0);
    });

    it("aggregates daily buckets for 7d horizon", async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);

      const taps: LoveTap[] = [
        makeTap(yesterday),
        makeTap(yesterday),
      ];

      (mockRepo.getTapsInRange as ReturnType<typeof vi.fn>).mockResolvedValue(taps);

      const result = await service.getFrequencyData("7d");
      expect(result.totalTaps).toBe(2);
      expect(result.buckets.length).toBeGreaterThanOrEqual(7);
    });

    it("aggregates daily buckets for 30d horizon", async () => {
      const now = new Date();
      const fiveDaysAgo = new Date(now);
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      fiveDaysAgo.setHours(12, 0, 0, 0);

      const taps: LoveTap[] = [makeTap(fiveDaysAgo)];

      (mockRepo.getTapsInRange as ReturnType<typeof vi.fn>).mockResolvedValue(taps);

      const result = await service.getFrequencyData("30d");
      expect(result.totalTaps).toBe(1);
      expect(result.buckets.length).toBeGreaterThanOrEqual(30);
    });

    it("identifies the peak label correctly", async () => {
      const now = new Date();
      const twoHoursAgo = new Date(now);
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

      const taps: LoveTap[] = [
        makeTap(twoHoursAgo),
        makeTap(twoHoursAgo),
        makeTap(twoHoursAgo),
        makeTap(new Date(now.getTime() - 30 * 60 * 1000)),
      ];

      (mockRepo.getTapsInRange as ReturnType<typeof vi.fn>).mockResolvedValue(taps);

      const result = await service.getFrequencyData("24h");
      expect(result.peakLabel).not.toBe("N/A");
    });
  });

  describe("getTotalTapCount", () => {
    it("returns total count of all taps", async () => {
      const taps: LoveTap[] = [
        makeTap(new Date()),
        makeTap(new Date()),
      ];
      (mockRepo.getTapsInRange as ReturnType<typeof vi.fn>).mockResolvedValue(taps);

      const count = await service.getTotalTapCount();
      expect(count).toBe(2);
    });
  });
});
