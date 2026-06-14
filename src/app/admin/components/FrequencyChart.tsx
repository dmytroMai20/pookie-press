"use client";

import { AreaChart } from "@tremor/react";
import type { FrequencyBucket } from "@/domain/services/AnalyticsService";

interface FrequencyChartProps {
  buckets: FrequencyBucket[];
  loading?: boolean;
}

export function FrequencyChart({ buckets, loading }: FrequencyChartProps) {
  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-pink-500" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-4 text-sm font-medium text-white/60">Tap Frequency</h2>
      <AreaChart
        className="h-72"
        data={buckets}
        index="label"
        categories={["count"]}
        colors={["pink"]}
        showGradient={true}
        curveType="monotone"
        showLegend={false}
        yAxisWidth={40}
        showGridLines={false}
        valueFormatter={(v: number) => v.toLocaleString()}
      />
    </div>
  );
}
