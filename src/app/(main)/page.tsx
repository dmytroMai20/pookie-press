"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePusher, type TapEventData } from "@/adapters/pusher/usePusher";
import { HeartButton } from "./components/HeartButton";
import { FloatingHearts, randomHeartProps, type HeartProps } from "./components/FloatingHearts";
import { LoveMeter } from "./components/LoveMeter";
import { CameraCapture } from "./components/CameraCapture";
import { useImageOverlay, ImageOverlay } from "./components/ImageOverlay";

export default function HomePage() {
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [goal, setGoal] = useState(50);
  const [hearts, setHearts] = useState<{ id: string; props: HeartProps }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const isSendingRef = useRef(false);
  const { image, showImage } = useImageOverlay();

  const spawnHearts = useCallback((count: number = 1) => {
    const newHearts = Array.from({ length: count }, () => ({
      id: crypto.randomUUID(),
      props: randomHeartProps(),
    }));
    const ids = newHearts.map((h) => h.id);
    setHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !ids.includes(h.id)));
    }, 2000);
  }, []);

  usePusher(
    useCallback((event: TapEventData) => {
      if (isSendingRef.current) return;
      const count = event.count || 1;
      spawnHearts(count);
      setWeeklyCount((c) => c + count);
    }, [spawnHearts]),
    showImage
  );

  useEffect(() => {
    let ignore = false;
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok && !ignore) {
          const data = await res.json();
          setWeeklyCount(data.weeklyCount);
          setGoal(data.goal);
        }
      } catch {
        // silently fail — stats will update on next tap
      }
    }
    fetchStats();
    return () => { ignore = true; };
  }, []);

  const tapQueue = useRef(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const flushTaps = useCallback(async () => {
    const count = tapQueue.current;
    if (count === 0) return;
    tapQueue.current = 0;
    isSendingRef.current = true;
    setIsSending(true);

    // Clear interval if running
    if (intervalTimer.current) {
      clearInterval(intervalTimer.current);
      intervalTimer.current = null;
    }

    try {
      const res = await fetch("/api/tap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });

      if (res.ok) {
        const data = await res.json();
        setWeeklyCount(data.weeklyCount);
      } else {
        setWeeklyCount((c) => c - count);
      }
    } catch {
      setWeeklyCount((c) => c - count);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        isSendingRef.current = false;
      }, 500);
    }
  }, []);

  const handleTap = () => {
    spawnHearts(1);
    setWeeklyCount((c) => c + 1); 
    tapQueue.current += 1;

    // Debounce: flush after 300ms of inactivity
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flushTaps, 300);

    // Interval cap: flush every 1s during sustained tapping
    if (!intervalTimer.current) {
      intervalTimer.current = setInterval(flushTaps, 500);
    }
  };

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
      <FloatingHearts hearts={hearts} />
      <ImageOverlay image={image} />

      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-lg font-medium tracking-tight text-white/70">
            Pookie-Press
          </h1>
          <p className="mt-0.5 text-xs text-white/40">tap to send love to pooks!</p>
        </div>

        <HeartButton onTap={handleTap} disabled={isSending} />

        <LoveMeter count={weeklyCount} goal={goal} />

        <CameraCapture />
      </div>
    </main>
  );
}
