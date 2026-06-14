# Image Snap Feature

## Overview

Users can take a photo using their device camera. The image is uploaded to S3, metadata is stored in PostgreSQL, and a Pusher event broadcasts the image URL to all connected clients. The image is displayed as a fullscreen overlay for a configurable number of seconds before fading out.

## Data Flow

```
Camera snap (client)
  → Client-side resize (canvas, max 1080px, JPEG 80%)
  → POST /api/image (multipart/form-data)
    → Server validates: file type, size ≤ IMAGE_MAX_SIZE_MB
    → sharp resizes (max 1080px, JPEG 80%)
    → S3StorageAdapter.upload(key, buffer, "image/jpeg")
    → PrismaImageRepository.save(metadata)
    → Generate presigned URL (1h expiry)
    → PusherServerAdapter.broadcastImage({ imageId, url, displaySeconds })
  ← 201 Created { imageId }

Other client receives Pusher "image-snap" event
  → ImageOverlay renders with presigned URL
  → Auto-dismiss after displaySeconds
```

## Pusher Event Schema

**Channel**: `pookie-press`
**Event**: `image-snap`

```typescript
{
  imageId: string;       // cuid from DB
  url: string;           // presigned S3 URL (1h expiry)
  displaySeconds: number; // from IMAGE_DISPLAY_SECONDS env
  timestamp: string;     // ISO 8601
}
```

## Database Schema

```sql
CREATE TABLE image_snaps (
  id          TEXT PRIMARY KEY,
  s3_key      TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes  INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL,
  user_id     TEXT
);
CREATE INDEX idx_image_snaps_uploaded_at ON image_snaps(uploaded_at);
```

## S3 Key Structure

```
images/{year}/{month}/{timestamp}-{random}.jpg
```

Objects under `images/` auto-expire after 7 days via S3 lifecycle rule.

## Rate Limiting

Image uploads are rate-limited to **5 per minute per IP**, separate from tap rate limits.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `IMAGE_DISPLAY_SECONDS` | `5` | How long the overlay is shown |
| `IMAGE_MAX_SIZE_MB` | `5` | Max upload size before rejection |

## Post-MVP Extensions

- **Image collage**: Query `image_snaps` by date range to build collages
- **CloudFront CDN**: Swap `S3StorageAdapter` for `CloudFrontStorageAdapter` in `container.ts`
- **Kafka events**: Emit image upload events to Kafka for analytics pipeline
