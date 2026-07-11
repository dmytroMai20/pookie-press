import { describe, it, expect } from "vitest";
import { WebSocketServerAdapter } from "@/adapters/websocket/WebSocketServerAdapter";

describe("WebSocketServerAdapter", () => {
  it("implements RealtimeGateway as no-op (WS server handles broadcast)", async () => {
    const adapter = new WebSocketServerAdapter();

    await expect(adapter.broadcastTap({ id: "tap-1", timestamp: "2024-01-15T12:00:00.000Z", count: 1 })).resolves.toBeUndefined();
    await expect(adapter.broadcastImage({ imageId: "img-1", url: "https://cdn.example.com/img.jpg", timestamp: "2024-01-15T12:00:00.000Z" })).resolves.toBeUndefined();
  });
});
