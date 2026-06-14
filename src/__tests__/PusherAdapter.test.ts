import { describe, it, expect, vi, beforeEach } from "vitest";

const mockTrigger = vi.fn().mockResolvedValue(undefined);

vi.mock("pusher", () => {
  return {
    default: class MockPusher {
      trigger = mockTrigger;
    },
  };
});

import { PusherServerAdapter, CHANNEL_NAME, EVENT_NAME } from "@/adapters/pusher/PusherServerAdapter";

describe("PusherServerAdapter", () => {
  let adapter: PusherServerAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PUSHER_APP_ID = "test-app-id";
    process.env.PUSHER_KEY = "test-key";
    process.env.PUSHER_SECRET = "test-secret";
    process.env.PUSHER_CLUSTER = "us2";
    adapter = new PusherServerAdapter();
  });

  it("broadcasts tap event to correct channel", async () => {
    const event = { id: "tap-1", timestamp: "2024-01-15T12:00:00.000Z", count: 1 };
    await adapter.broadcastTap(event);

    expect(mockTrigger).toHaveBeenCalledWith(CHANNEL_NAME, EVENT_NAME, event);
  });
});
