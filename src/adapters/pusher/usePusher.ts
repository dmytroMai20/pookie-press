"use client";

import { useEffect, useRef } from "react";
import PusherClient from "pusher-js";

const CHANNEL_NAME = "pookie-press";
const EVENT_NAME = "love-tap";

export interface TapEventData {
  id: string;
  timestamp: string;
  count: number;
}

export function usePusher(onTap: (event: TapEventData) => void) {
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      console.warn("Pusher env vars not set, real-time disabled");
      return;
    }

    const pusher = new PusherClient(key, { cluster });
    const channel = pusher.subscribe(CHANNEL_NAME);

    channel.bind(EVENT_NAME, (data: TapEventData) => {
      onTapRef.current(data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNEL_NAME);
      pusher.disconnect();
    };
  }, []);
}
