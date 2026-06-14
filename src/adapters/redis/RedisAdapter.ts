import { Redis } from "@upstash/redis";
import type { CachePort } from "@/ports/CachePort";

let _redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

export class RedisAdapter implements CachePort {
  private get redis() {
    return getRedisClient();
  }

  async incrementWeeklyCounter(weekKey: string): Promise<number> {
    return this.redis.incr(weekKey);
  }

  async incrementWeeklyCounterBy(weekKey: string, count: number): Promise<number> {
    return this.redis.incrby(weekKey, count);
  }

  async getWeeklyCounter(weekKey: string): Promise<number> {
    const value = await this.redis.get<number>(weekKey);
    return value ?? 0;
  }

  async setWeeklyCounter(weekKey: string, value: number, ttlSeconds: number): Promise<void> {
    await this.redis.set(weekKey, value, { ex: ttlSeconds });
  }
}
