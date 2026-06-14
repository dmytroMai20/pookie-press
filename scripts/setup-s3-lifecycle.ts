import {
  S3Client,
  PutBucketLifecycleConfigurationCommand,
} from "@aws-sdk/client-s3";

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;

if (!BUCKET || !REGION) {
  console.error("Set AWS_S3_BUCKET and AWS_REGION environment variables");
  process.exit(1);
}

const client = new S3Client({ region: REGION });

async function main() {
  await client.send(
    new PutBucketLifecycleConfigurationCommand({
      Bucket: BUCKET,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: "pookie-press-image-expiry",
            Status: "Enabled",
            Filter: { Prefix: "images/" },
            Expiration: { Days: 7 },
          },
        ],
      },
    })
  );

  console.log(
    `Lifecycle rule set: objects under images/ in "${BUCKET}" expire after 7 days.`
  );
}

main().catch((err) => {
  console.error("Failed to set lifecycle rule:", err);
  process.exit(1);
});
