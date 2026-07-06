"use client";

import { useEffect, useRef, useState } from "react";
import PusherClient from "pusher-js";

const CHANNEL_NAME = "pookie-press";
const EVENT_NAME = "love-tap";
const IMAGE_EVENT_NAME = "image-snap";

export interface TapEventData {
  id: string;
  timestamp: string;
  count: number;
  color?: string;
}

export interface ImageEventData {
  imageId: string;
  url: string;
  displaySeconds: number;
  timestamp: string;
}

export function usePusher(
  onTap: (event: TapEventData) => void,
  onImageSnap?: (event: ImageEventData) => void
) {
  const [connected, setConnected] = useState(false);
  const onTapRef = useRef(onTap);
  const onImageSnapRef = useRef(onImageSnap);
  useEffect(() => {
    onTapRef.current = onTap;
    onImageSnapRef.current = onImageSnap;
  });

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      console.warn("Pusher env vars not set, real-time disabled");
      return;
    }

    const pusher = new PusherClient(key, { cluster });

    pusher.connection.bind("connected", () => setConnected(true));
    pusher.connection.bind("disconnected", () => setConnected(false));
    pusher.connection.bind("failed", () => setConnected(false));

    const channel = pusher.subscribe(CHANNEL_NAME);

    channel.bind(EVENT_NAME, (data: TapEventData) => {
      onTapRef.current(data);
    });

    channel.bind(IMAGE_EVENT_NAME, (data: ImageEventData) => {
      onImageSnapRef.current?.(data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNEL_NAME);
      pusher.disconnect();
    };
  }, []);

  return { connected };
}
