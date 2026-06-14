import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImageService } from "@/domain/services/ImageService";
import type { ImageRepository } from "@/ports/ImageRepository";
import type { StorageGateway } from "@/ports/StorageGateway";
import type { RealtimeGateway } from "@/ports/RealtimeGateway";

function createMockImageRepository(): ImageRepository {
  return {
    save: vi.fn().mockImplementation((snap) =>
      Promise.resolve({ id: "img-1", ...snap })
    ),
    findRecent: vi.fn().mockResolvedValue([]),
    findByDateRange: vi.fn().mockResolvedValue([]),
  };
}

function createMockStorage(): StorageGateway {
  return {
    upload: vi.fn().mockResolvedValue("images/2024/01/test.jpg"),
    getSignedUrl: vi.fn().mockResolvedValue("https://s3.example.com/signed-url"),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockGateway(): RealtimeGateway {
  return {
    broadcastTap: vi.fn().mockResolvedValue(undefined),
    broadcastImage: vi.fn().mockResolvedValue(undefined),
  };
}

describe("ImageService", () => {
  let service: ImageService;
  let mockRepo: ImageRepository;
  let mockStorage: StorageGateway;
  let mockGateway: RealtimeGateway;

  beforeEach(() => {
    mockRepo = createMockImageRepository();
    mockStorage = createMockStorage();
    mockGateway = createMockGateway();
    service = new ImageService(mockRepo, mockStorage, mockGateway);
  });

  describe("processAndBroadcast", () => {
    const input = {
      buffer: Buffer.from("fake-image-data"),
      contentType: "image/jpeg",
      sizeBytes: 1024,
      displaySeconds: 5,
    };

    it("uploads image to storage", async () => {
      await service.processAndBroadcast(input);
      expect(mockStorage.upload).toHaveBeenCalledOnce();
      const [key, buffer, contentType] = (mockStorage.upload as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(key).toMatch(/^images\/\d{4}\/\d{2}\/\d+-.+\.jpg$/);
      expect(buffer).toBe(input.buffer);
      expect(contentType).toBe("image/jpeg");
    });

    it("persists metadata to repository", async () => {
      await service.processAndBroadcast(input);
      expect(mockRepo.save).toHaveBeenCalledOnce();
      const saved = (mockRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(saved.contentType).toBe("image/jpeg");
      expect(saved.sizeBytes).toBe(1024);
      expect(saved.expiresAt.getTime()).toBeGreaterThan(saved.uploadedAt.getTime());
    });

    it("sets expiration to 7 days from upload", async () => {
      await service.processAndBroadcast(input);
      const saved = (mockRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const diffDays = (saved.expiresAt.getTime() - saved.uploadedAt.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeCloseTo(7, 0);
    });

    it("generates presigned URL", async () => {
      await service.processAndBroadcast(input);
      expect(mockStorage.getSignedUrl).toHaveBeenCalledOnce();
      const [, expiresIn] = (mockStorage.getSignedUrl as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(expiresIn).toBe(3600);
    });

    it("broadcasts image event via realtime gateway", async () => {
      await service.processAndBroadcast(input);
      expect(mockGateway.broadcastImage).toHaveBeenCalledWith(
        expect.objectContaining({
          imageId: "img-1",
          url: "https://s3.example.com/signed-url",
          displaySeconds: 5,
        })
      );
    });

    it("returns the saved image snap", async () => {
      const result = await service.processAndBroadcast(input);
      expect(result.id).toBe("img-1");
      expect(result.contentType).toBe("image/jpeg");
    });

    it("includes userId when provided", async () => {
      await service.processAndBroadcast({ ...input, userId: "user-1" });
      const saved = (mockRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(saved.userId).toBe("user-1");
    });
  });

  describe("getRecentImages", () => {
    it("delegates to repository with limit", async () => {
      await service.getRecentImages(5);
      expect(mockRepo.findRecent).toHaveBeenCalledWith(5);
    });

    it("defaults to limit of 10", async () => {
      await service.getRecentImages();
      expect(mockRepo.findRecent).toHaveBeenCalledWith(10);
    });
  });

  describe("getImagesByDateRange", () => {
    it("delegates to repository", async () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-01-31");
      await service.getImagesByDateRange(start, end);
      expect(mockRepo.findByDateRange).toHaveBeenCalledWith(start, end);
    });
  });
});
