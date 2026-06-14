import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  PUSHER_APP_ID: z.string().min(1),
  PUSHER_KEY: z.string().min(1),
  PUSHER_SECRET: z.string().min(1),
  PUSHER_CLUSTER: z.string().min(1),
  WEEKLY_TAP_GOAL: z.coerce.number().int().positive().default(50),
  ADMIN_PASSWORD: z.string().min(16),
  JWT_SECRET: z.string().min(32),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_S3_BUCKET: z.string().min(1),
  IMAGE_DISPLAY_SECONDS: z.coerce.number().int().positive().default(5),
  IMAGE_MAX_SIZE_MB: z.coerce.number().positive().default(4.5),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _config: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!_config) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(
        `❌ Invalid environment variables:\n${JSON.stringify(parsed.error.format(), null, 2)}`
      );
    }
    _config = parsed.data;
  }
  return _config;
}
