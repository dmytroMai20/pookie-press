"use client";

import { motion } from "framer-motion";

interface HeartButtonProps {
  onTap: () => void;
  disabled?: boolean;
}

export function HeartButton({ onTap, disabled }: HeartButtonProps) {
  return (
    <motion.button
      onClick={onTap}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_0_50px_rgba(236,72,153,0.4)] transition-shadow hover:shadow-[0_0_80px_rgba(236,72,153,0.6)] disabled:opacity-70"
      aria-label="Send love tap"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-20 w-20 text-white"
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      </motion.div>

      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-pink-400/50"
        animate={{
          scale: [1, 1.3],
          opacity: [0.5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    </motion.button>
  );
}
