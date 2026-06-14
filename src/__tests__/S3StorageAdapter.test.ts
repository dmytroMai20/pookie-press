import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSend, mockGetSignedUrl } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({}),
  mockGetSignedUrl: vi.fn().mockResolvedValue("https://s3.example.com/signed"),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = mockSend;
  },
  PutObjectCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
  GetObjectCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
  DeleteObjectCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: mockGetSignedUrl,
}));

import { S3StorageAdapter } from "@/adapters/s3/S3StorageAdapter";

describe("S3StorageAdapter", () => {
  let adapter: S3StorageAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_ACCESS_KEY_ID = "test-key";
    process.env.AWS_SECRET_ACCESS_KEY = "test-secret";
    adapter = new S3StorageAdapter("test-bucket");
  });

  it("uploads with correct bucket and key", async () => {
    const buffer = Buffer.from("test-data");
    await adapter.upload("images/test.jpg", buffer, "image/jpeg");

    expect(mockSend).toHaveBeenCalledOnce();
    const command = mockSend.mock.calls[0][0];
    expect(command.input).toEqual({
      Bucket: "test-bucket",
      Key: "images/test.jpg",
      Body: buffer,
      ContentType: "image/jpeg",
    });
  });

  it("returns key from upload", async () => {
    const result = await adapter.upload("images/test.jpg", Buffer.from("x"), "image/jpeg");
    expect(result).toBe("images/test.jpg");
  });

  it("generates presigned URL", async () => {
    const url = await adapter.getSignedUrl("images/test.jpg", 3600);
    expect(url).toBe("https://s3.example.com/signed");
    expect(mockGetSignedUrl).toHaveBeenCalledOnce();
  });

  it("generates presigned upload URL", async () => {
    const url = await adapter.getUploadUrl("images/test.jpg", "image/jpeg", 5242880, 300);
    expect(url).toBe("https://s3.example.com/signed");
    expect(mockGetSignedUrl).toHaveBeenCalledOnce();
  });

  it("deletes object", async () => {
    await adapter.delete("images/test.jpg");
    expect(mockSend).toHaveBeenCalledOnce();
    const command = mockSend.mock.calls[0][0];
    expect(command.input).toEqual({
      Bucket: "test-bucket",
      Key: "images/test.jpg",
    });
  });
});
