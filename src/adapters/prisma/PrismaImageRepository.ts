import { prisma } from "@/adapters/prisma/PrismaTapRepository";
import type { ImageRepository } from "@/ports/ImageRepository";
import type { ImageSnap } from "@/domain/models/ImageSnap";

export class PrismaImageRepository implements ImageRepository {
  async save(snap: Omit<ImageSnap, "id">): Promise<ImageSnap> {
    const result = await prisma.imageSnap.create({
      data: {
        s3Key: snap.s3Key,
        contentType: snap.contentType,
        sizeBytes: snap.sizeBytes,
        uploadedAt: snap.uploadedAt,
        expiresAt: snap.expiresAt,
        userId: snap.userId,
      },
    });
    return {
      id: result.id,
      s3Key: result.s3Key,
      contentType: result.contentType,
      sizeBytes: result.sizeBytes,
      uploadedAt: result.uploadedAt,
      expiresAt: result.expiresAt,
      userId: result.userId ?? undefined,
    };
  }

  async findRecent(limit: number): Promise<ImageSnap[]> {
    const results = await prisma.imageSnap.findMany({
      orderBy: { uploadedAt: "desc" },
      take: limit,
    });
    return results.map((r) => ({
      id: r.id,
      s3Key: r.s3Key,
      contentType: r.contentType,
      sizeBytes: r.sizeBytes,
      uploadedAt: r.uploadedAt,
      expiresAt: r.expiresAt,
      userId: r.userId ?? undefined,
    }));
  }

  async findByDateRange(start: Date, end: Date): Promise<ImageSnap[]> {
    const results = await prisma.imageSnap.findMany({
      where: {
        uploadedAt: { gte: start, lte: end },
      },
      orderBy: { uploadedAt: "desc" },
    });
    return results.map((r) => ({
      id: r.id,
      s3Key: r.s3Key,
      contentType: r.contentType,
      sizeBytes: r.sizeBytes,
      uploadedAt: r.uploadedAt,
      expiresAt: r.expiresAt,
      userId: r.userId ?? undefined,
    }));
  }
}
