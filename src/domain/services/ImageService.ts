import type { ImageRepository } from "@/ports/ImageRepository";
import type { StorageGateway } from "@/ports/StorageGateway";
import type { RealtimeGateway } from "@/ports/RealtimeGateway";
import type { ImageSnap } from "@/domain/models/ImageSnap";

const IMAGE_RETENTION_DAYS = 7;
const PRESIGNED_URL_EXPIRY_SECONDS = 60 * 60;

export interface ProcessImageInput {
  buffer: Buffer;
  contentType: string;
  sizeBytes: number;
  displaySeconds: number;
  userId?: string;
}

export class ImageService {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly storage: StorageGateway,
    private readonly realtimeGateway: RealtimeGateway
  ) {}

  async processAndBroadcast(input: ProcessImageInput): Promise<ImageSnap> {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + IMAGE_RETENTION_DAYS);

    const s3Key = `images/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getTime()}-${randomSuffix()}.jpg`;

    await this.storage.upload(s3Key, input.buffer, input.contentType);

    const snap = await this.imageRepository.save({
      s3Key,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      uploadedAt: now,
      expiresAt,
      userId: input.userId,
    });

    const url = await this.storage.getSignedUrl(s3Key, PRESIGNED_URL_EXPIRY_SECONDS);

    await this.realtimeGateway.broadcastImage({
      imageId: snap.id,
      url,
      displaySeconds: input.displaySeconds,
      timestamp: now.toISOString(),
    });

    return snap;
  }

  async getRecentImages(limit: number = 10): Promise<ImageSnap[]> {
    return this.imageRepository.findRecent(limit);
  }

  async getImagesByDateRange(start: Date, end: Date): Promise<ImageSnap[]> {
    return this.imageRepository.findByDateRange(start, end);
  }
}

function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 8);
}
