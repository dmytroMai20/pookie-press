import type { RealtimeGateway, TapEvent, ImageEvent } from "@/ports/RealtimeGateway";

/**
 * No-op adapter — the C++ WebSocket server handles broadcasting
 * directly from client messages, so server-side push is unnecessary.
 */
export class WebSocketServerAdapter implements RealtimeGateway {
  async broadcastTap(_event: TapEvent): Promise<void> {}
  async broadcastImage(_event: ImageEvent): Promise<void> {}
}
