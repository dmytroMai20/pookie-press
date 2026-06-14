# S3 Setup for Image Uploads

## Bucket Configuration

1. Create an S3 bucket (e.g. `pookie-press-images`)
2. Set region to match `AWS_REGION` in `.env`
3. Block all public access (images are served via presigned URLs)
4. Create an IAM user with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutLifecycleConfiguration"
      ],
      "Resource": [
        "arn:aws:s3:::pookie-press-images",
        "arn:aws:s3:::pookie-press-images/*"
      ]
    }
  ]
}
```

5. Copy the access key ID and secret to `.env`

## 7-Day Lifecycle Rule

Images are stored under the `images/` prefix and should auto-delete after 7 days.

### Option A: Automated Script

```bash
# Ensure AWS env vars are set, then run:
npx tsx scripts/setup-s3-lifecycle.ts
```

### Option B: AWS Console

1. Go to S3 → your bucket → Management → Lifecycle rules
2. Create rule:
   - **Name**: `pookie-press-image-expiry`
   - **Prefix filter**: `images/`
   - **Expiration**: 7 days after creation
3. Save

## Environment Variables

```
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_REGION=<e.g. us-east-1>
AWS_S3_BUCKET=<your-bucket-name>
```

## CDN (Post-MVP)

The `StorageGateway` port supports swapping presigned URLs for a CloudFront distribution. To migrate:

1. Create a CloudFront distribution pointed at the S3 bucket
2. Implement a `CloudFrontStorageAdapter` that returns CloudFront URLs from `getSignedUrl()`
3. Update `container.ts` to inject the new adapter
