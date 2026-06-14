export interface ImageSnap {
  id: string;
  s3Key: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: Date;
  expiresAt: Date;
  userId?: string;
}
