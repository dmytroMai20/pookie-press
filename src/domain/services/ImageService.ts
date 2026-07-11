import type { ImageRepository } from "@/ports/ImageRepository";
import type { StorageGateway } from "@/ports/StorageGateway";
import type { ImageSnap } from "@/domain/models/ImageSnap";

const IMAGE_RETENTION_DAYS = 7;
const PRESIGNED_URL_EXPIRY_SECONDS = 60 * 60;
const UPLOAD_URL_EXPIRY_SECONDS = 5 * 60;

export interface PresignResult {
  uploadUrl: string;
  s3Key: string;
}

export interface ConfirmInput {
  s3Key: string;
  contentType: string;
  sizeBytes: number;
  userId?: string;
}

export interface ConfirmResult {
  snap: ImageSnap;
  imageId: string;
  url: string;
  timestamp: string;
}

export class ImageService {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly storage: StorageGateway
  ) {}

  async createUploadUrl(
    contentType: string,
    maxSizeBytes: number
  ): Promise<PresignResult> {
    const now = new Date();
    const s3Key = `images/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getTime()}-${randomSuffix()}.jpg`;

    const uploadUrl = await this.storage.getUploadUrl(
      s3Key,
      contentType,
      maxSizeBytes,
      UPLOAD_URL_EXPIRY_SECONDS
    );

    return { uploadUrl, s3Key };
  }

  async confirmUpload(input: ConfirmInput): Promise<ConfirmResult> {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + IMAGE_RETENTION_DAYS);

    const snap = await this.imageRepository.save({
      s3Key: input.s3Key,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      uploadedAt: now,
      expiresAt,
      userId: input.userId,
    });

    const url = await this.storage.getSignedUrl(input.s3Key, PRESIGNED_URL_EXPIRY_SECONDS);

    return {
      snap,
      imageId: snap.id,
      url,
      timestamp: now.toISOString(),
    };
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
