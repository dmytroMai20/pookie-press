import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageGateway } from "@/ports/StorageGateway";

let _client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

export class S3StorageAdapter implements StorageGateway {
  private readonly bucket: string;

  constructor(bucket?: string) {
    this.bucket = bucket ?? process.env.AWS_S3_BUCKET!;
  }

  async upload(key: string, data: Buffer, contentType: string): Promise<string> {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      })
    );
    return key;
  }

  async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    const client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }

  async getUploadUrl(
    key: string,
    contentType: string,
    _maxSizeBytes: number,
    expiresInSeconds: number
  ): Promise<string> {
    const client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(client, command, {
      expiresIn: expiresInSeconds,
      unhoistableHeaders: new Set(["content-type"]),
    });
  }

  async delete(key: string): Promise<void> {
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }
}
