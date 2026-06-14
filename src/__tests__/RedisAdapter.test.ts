import { describe, it, expect, vi, beforeEach } from "vitest";

const mockIncr = vi.fn();
const mockGet = vi.fn();
const mockSet = vi.fn();

vi.mock("@upstash/redis", () => {
  return {
    Redis: class MockRedis {
      incr = mockIncr;
      get = mockGet;
      set = mockSet;
    },
  };
});

import { RedisAdapter } from "@/adapters/redis/RedisAdapter";

describe("RedisAdapter", () => {
  let adapter: RedisAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    adapter = new RedisAdapter();
  });

  it("increments weekly counter", async () => {
    mockIncr.mockResolvedValue(5);
    const result = await adapter.incrementWeeklyCounter("weekly:2024:w3");
    expect(result).toBe(5);
  });

  it("gets weekly counter", async () => {
    mockGet.mockResolvedValue(10);
    const result = await adapter.getWeeklyCounter("weekly:2024:w3");
    expect(result).toBe(10);
  });

  it("returns 0 when counter is null", async () => {
    mockGet.mockResolvedValue(null);
    const result = await adapter.getWeeklyCounter("weekly:2024:w3");
    expect(result).toBe(0);
  });
});
