"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { decode, encode } from "@msgpack/msgpack";
import type {
  TapEvent,
  ImageEvent,
  InboundMessage,
  ServerMessage,
} from "./types";

export type { TapEvent, ImageEvent };

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];

export function useWebSocket(
  onTap: (event: TapEvent) => void,
  onImageSnap?: (event: ImageEvent) => void
) {
  const [connected, setConnected] = useState(false);
  const onTapRef = useRef(onTap);
  const onImageSnapRef = useRef(onImageSnap);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onTapRef.current = onTap;
    onImageSnapRef.current = onImageSnap;
  });

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL;

    if (!url) {
      return;
    }

    function connect() {
      const ws = new WebSocket(url!);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.addEventListener("open", () => {
        setConnected(true);
        reconnectAttempt.current = 0;
      });

      ws.addEventListener("close", () => {
        setConnected(false);
        scheduleReconnect();
      });

      ws.addEventListener("error", () => {
        ws.close();
      });

      ws.addEventListener("message", (event) => {
        try {
          const msg = decode(new Uint8Array(event.data)) as ServerMessage;

          if ("error" in msg) {
            return;
          }

          switch (msg.type) {
            case "tap":
              onTapRef.current(msg.payload);
              break;
            case "image":
              onImageSnapRef.current?.(msg.payload);
              break;
            case "tap_batch":
              for (const tap of msg.payload) {
                onTapRef.current(tap);
              }
              break;
            case "image_batch":
              for (const img of msg.payload) {
                onImageSnapRef.current?.(img);
              }
              break;
          }
        } catch {
          // malformed message — ignore
        }
      });
    }

    function scheduleReconnect() {
      const delay =
        RECONNECT_DELAYS[
          Math.min(reconnectAttempt.current, RECONNECT_DELAYS.length - 1)
        ];
      reconnectAttempt.current += 1;
      reconnectTimer.current = setTimeout(connect, delay);
    }

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  const sendTap = useCallback((event: TapEvent) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const msg: InboundMessage = { type: "tap", payload: event };
    ws.send(encode(msg));
  }, []);

  const sendImage = useCallback((event: ImageEvent) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const msg: InboundMessage = { type: "image", payload: event };
    ws.send(encode(msg));
  }, []);

  return { connected, sendTap, sendImage };
}
