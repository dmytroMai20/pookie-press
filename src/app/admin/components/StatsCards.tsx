"use client";

interface StatsCardsProps {
  totalTaps: number;
  weeklyCount: number;
  goal: number;
  progress: number;
  peakLabel: string;
}

export function StatsCards({ totalTaps, weeklyCount, goal, progress, peakLabel }: StatsCardsProps) {
  const cards = [
    { title: "Total Taps", value: totalTaps.toLocaleString() },
    { title: "This Week", value: `${weeklyCount} / ${goal}` },
    { title: "Weekly Progress", value: `${progress}%` },
    { title: "Peak Period", value: peakLabel },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-white/10 bg-white/5 p-5"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">
            {card.title}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
