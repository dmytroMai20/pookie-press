"use client";

import type { Horizon } from "@/domain/services/AnalyticsService";

interface HorizonSelectorProps {
  selected: Horizon;
  onChange: (horizon: Horizon) => void;
}

const OPTIONS: { value: Horizon; label: string }[] = [
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
];

export function HorizonSelector({ selected, onChange }: HorizonSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
            selected === option.value
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
