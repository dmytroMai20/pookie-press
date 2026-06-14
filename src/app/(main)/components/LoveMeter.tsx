"use client";

import { motion } from "framer-motion";
import { calculateProgress } from "@/domain/models/WeeklyGoal";

interface LoveMeterProps {
  count: number;
  goal: number;
}

export function LoveMeter({ count, goal }: LoveMeterProps) {
  const progress = calculateProgress(count, goal);

  return (
    <div className="w-64 space-y-2">
      <div className="flex justify-between text-xs text-white/60">
        <span>{count} taps</span>
        <span>{goal} goal</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
      <p className="text-center text-xs text-white/40">
        {progress}% of weekly goal
      </p>
    </div>
  );
}
