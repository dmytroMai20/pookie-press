import { describe, it, expect, vi, beforeEach } from "vitest";
import { TapService } from "@/domain/services/TapService";
import type { TapRepository } from "@/ports/TapRepository";
import type { RealtimeGateway } from "@/ports/RealtimeGateway";
import type { CachePort } from "@/ports/CachePort";

function createMockRepository(): TapRepository {
  return {
    recordTap: vi.fn().mockResolvedValue({
      id: "tap-1",
      timestamp: new Date("2024-01-15T12:00:00Z"),
      userId: undefined,
      count: 1,
    }),
    getWeeklyCount: vi.fn().mockResolvedValue(10),
    getTapsInRange: vi.fn().mockResolvedValue([]),
  };
}

function createMockGateway(): RealtimeGateway {
  return {
    broadcastTap: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockCache(): CachePort {
  return {
    incrementWeeklyCounter: vi.fn().mockResolvedValue(11),
    incrementWeeklyCounterBy: vi.fn().mockResolvedValue(15),
    getWeeklyCounter: vi.fn().mockResolvedValue(0),
    setWeeklyCounter: vi.fn().mockResolvedValue(undefined),
  };
}

describe("TapService", () => {
  let service: TapService;
  let mockRepo: TapRepository;
  let mockGateway: RealtimeGateway;
  let mockCache: CachePort;

  beforeEach(() => {
    mockRepo = createMockRepository();
    mockGateway = createMockGateway();
    mockCache = createMockCache();
    service = new TapService(mockRepo, mockGateway, mockCache);
  });

  describe("recordTap", () => {
    it("persists tap to repository", async () => {
      await service.recordTap();
      expect(mockRepo.recordTap).toHaveBeenCalledOnce();
    });

    it("increments cache counter", async () => {
      await service.recordTap();
      expect(mockCache.incrementWeeklyCounter).toHaveBeenCalledOnce();
    });

    it("broadcasts via realtime gateway", async () => {
      await service.recordTap();
      expect(mockGateway.broadcastTap).toHaveBeenCalledWith({
        id: "tap-1",
        timestamp: "2024-01-15T12:00:00.000Z",
        count: 1,
      });
    });

    it("returns the created tap and weekly count", async () => {
      const result = await service.recordTap();
      expect(result.tap.id).toBe("tap-1");
      expect(result.weeklyCount).toBe(11);
    });
  });

  describe("getWeeklyCount", () => {
    it("returns cached count when available", async () => {
      (mockCache.getWeeklyCounter as ReturnType<typeof vi.fn>).mockResolvedValue(15);
      const count = await service.getWeeklyCount();
      expect(count).toBe(15);
      expect(mockRepo.getWeeklyCount).not.toHaveBeenCalled();
    });

    it("falls back to repository when cache is empty", async () => {
      (mockCache.getWeeklyCounter as ReturnType<typeof vi.fn>).mockResolvedValue(0);
      const count = await service.getWeeklyCount();
      expect(count).toBe(10);
      expect(mockRepo.getWeeklyCount).toHaveBeenCalledOnce();
    });

    it("populates cache after repository fallback", async () => {
      (mockCache.getWeeklyCounter as ReturnType<typeof vi.fn>).mockResolvedValue(0);
      await service.getWeeklyCount();
      expect(mockCache.setWeeklyCounter).toHaveBeenCalledOnce();
    });
  });
});
