import Pusher from "pusher";
import type { RealtimeGateway, TapEvent } from "@/ports/RealtimeGateway";

let _pusher: Pusher | null = null;

function getPusherServer(): Pusher {
  if (!_pusher) {
    _pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return _pusher;
}

export const CHANNEL_NAME = "pookie-press";
export const EVENT_NAME = "love-tap";

export class PusherServerAdapter implements RealtimeGateway {
  async broadcastTap(event: TapEvent): Promise<void> {
    await getPusherServer().trigger(CHANNEL_NAME, EVENT_NAME, event);
  }
}
