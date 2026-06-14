import type { ImageSnap } from "@/domain/models/ImageSnap";

export interface ImageRepository {
  save(snap: Omit<ImageSnap, "id">): Promise<ImageSnap>;
  findRecent(limit: number): Promise<ImageSnap[]>;
  findByDateRange(start: Date, end: Date): Promise<ImageSnap[]>;
}
