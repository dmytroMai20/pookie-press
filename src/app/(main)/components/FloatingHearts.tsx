"use client";

import { motion, AnimatePresence } from "framer-motion";

// Default fallback color if none provided
const DEFAULT_COLOR = "#F2A7C3";

export interface HeartProps {
  x: number;
  y: number;
  size: number;
  duration: number;
  rotation: number;
  color: string;
}

export function randomHeartProps(color?: string): HeartProps {
  return {
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 28 + Math.random() * 32,
    duration: 1.2 + Math.random() * 0.8,
    rotation: -15 + Math.random() * 30,
    color: color || DEFAULT_COLOR,
  };
}

interface FloatingHeartsProps {
  hearts: { id: string; props: HeartProps }[];
}

export function FloatingHearts({ hearts }: FloatingHeartsProps) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <AnimatePresence>
        {hearts.map((heart) => (
          <Heart key={heart.id} {...heart.props} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Heart({ x, y, size, duration, rotation, color }: HeartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1, 1, 0.8] }}
      exit={{ opacity: 0 }}
      transition={{ duration, ease: "easeOut", times: [0, 0.15, 0.7, 1] }}
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        rotate: `${rotation}deg`,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={color}
        style={{ width: size, height: size, opacity: 0.85 }}
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    </motion.div>
  );
}
