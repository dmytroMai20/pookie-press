"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ImageEvent as ImageEventData } from "@/adapters/websocket/types";

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
  const [images, setImages] = useState<PositionedImage[]>([]);

  const showImage = useCallback((event: ImageEventData) => {
    const pos = randomPosition();
    const entry: PositionedImage = { event, ...pos };
    setImages((prev) => [...prev, entry]);

    setTimeout(() => {
      setImages((prev) => prev.filter((img) => img.event.imageId !== event.imageId));
    }, 5000);
  }, []);

  return { images, showImage };
}

export function ImageOverlay({ images }: { images: PositionedImage[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {images.map((image) => (
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
                className="w-full object-cover -scale-x-100"
              />
            </div>
            <p className="mt-1 text-center text-[10px] text-white/50">
              from your pookie
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
