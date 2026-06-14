"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ImageEventData } from "@/adapters/pusher/usePusher";

interface PositionedImage {
  event: ImageEventData;
  x: number;
  y: number;
  rotation: number;
}

function randomPosition(): { x: number; y: number; rotation: number } {
  return {
    x: 10 + Math.random() * 55,
    y: 10 + Math.random() * 55,
    rotation: -8 + Math.random() * 16,
  };
}

export function useImageOverlay() {
  const [image, setImage] = useState<PositionedImage | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showImage = useCallback((event: ImageEventData) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const pos = randomPosition();
    setImage({ event, ...pos });
  }, []);

  useEffect(() => {
    if (!image) return;

    timerRef.current = setTimeout(() => {
      setImage(null);
    }, image.event.displaySeconds * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [image]);

  return { image, showImage };
}

export function ImageOverlay({ image }: { image: PositionedImage | null }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {image && (
          <motion.div
            key={image.event.imageId}
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute w-48 sm:w-56 md:w-64"
            style={{
              left: `${image.x}%`,
              top: `${image.y}%`,
              rotate: `${image.rotation}deg`,
            }}
          >
            <div className="overflow-hidden rounded-lg border-2 border-white/20 shadow-xl shadow-pink-500/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.event.url}
                alt="Pookie snap"
                className="w-full object-cover"
              />
            </div>
            <p className="mt-1 text-center text-[10px] text-white/50">
              from your pookie
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
