import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImageService } from "@/domain/services/ImageService";
import type { ImageRepository } from "@/ports/ImageRepository";
import type { StorageGateway } from "@/ports/StorageGateway";

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
    getUploadUrl: vi.fn().mockResolvedValue("https://s3.example.com/presigned-put"),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

describe("ImageService", () => {
  let service: ImageService;
  let mockRepo: ImageRepository;
  let mockStorage: StorageGateway;

  beforeEach(() => {
    mockRepo = createMockImageRepository();
    mockStorage = createMockStorage();
    service = new ImageService(mockRepo, mockStorage);
  });

  describe("createUploadUrl", () => {
    it("generates a presigned upload URL", async () => {
      const result = await service.createUploadUrl("image/jpeg", 5 * 1024 * 1024);
      expect(mockStorage.getUploadUrl).toHaveBeenCalledOnce();
      expect(result.uploadUrl).toBe("https://s3.example.com/presigned-put");
      expect(result.s3Key).toMatch(/^images\/\d{4}\/\d{2}\/\d+-.+\.jpg$/);
    });

    it("passes content type and max size to storage", async () => {
      await service.createUploadUrl("image/jpeg", 4718592);
      const [, contentType, maxSize] = (mockStorage.getUploadUrl as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(contentType).toBe("image/jpeg");
      expect(maxSize).toBe(4718592);
    });
  });

  describe("confirmUpload", () => {
    const input = {
      s3Key: "images/2024/01/test.jpg",
      contentType: "image/jpeg",
      sizeBytes: 1024,
    };

    it("persists metadata to repository", async () => {
      await service.confirmUpload(input);
      expect(mockRepo.save).toHaveBeenCalledOnce();
      const saved = (mockRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(saved.contentType).toBe("image/jpeg");
      expect(saved.sizeBytes).toBe(1024);
      expect(saved.s3Key).toBe("images/2024/01/test.jpg");
    });

    it("sets expiration to 7 days from upload", async () => {
      await service.confirmUpload(input);
      const saved = (mockRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const diffDays = (saved.expiresAt.getTime() - saved.uploadedAt.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeCloseTo(7, 0);
    });

    it("generates presigned GET URL", async () => {
      await service.confirmUpload(input);
      expect(mockStorage.getSignedUrl).toHaveBeenCalledOnce();
      const [key, expiresIn] = (mockStorage.getSignedUrl as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(key).toBe("images/2024/01/test.jpg");
      expect(expiresIn).toBe(3600);
    });

    it("returns image metadata for client broadcast", async () => {
      const result = await service.confirmUpload(input);
      expect(result.imageId).toBe("img-1");
      expect(result.url).toBe("https://s3.example.com/signed-url");
      expect(result.timestamp).toBeDefined();
    });

    it("returns the saved image snap", async () => {
      const result = await service.confirmUpload(input);
      expect(result.snap.id).toBe("img-1");
      expect(result.snap.contentType).toBe("image/jpeg");
    });

    it("includes userId when provided", async () => {
      await service.confirmUpload({ ...input, userId: "user-1" });
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
