export interface StorageGateway {
  upload(key: string, data: Buffer, contentType: string): Promise<string>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  getUploadUrl(key: string, contentType: string, maxSizeBytes: number, expiresInSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
}
