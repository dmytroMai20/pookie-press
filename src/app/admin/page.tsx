"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Horizon, FrequencyBucket } from "@/domain/services/AnalyticsService";
import { StatsCards } from "./components/StatsCards";
import { HorizonSelector } from "./components/HorizonSelector";
import { FrequencyChart } from "./components/FrequencyChart";

interface AnalyticsResponse {
  frequency: {
    buckets: FrequencyBucket[];
    totalTaps: number;
    peakLabel: string;
  };
  summary: {
    totalTaps: number;
    weeklyCount: number;
    goal: number;
    progress: number;
  };
}

export default function AdminPage() {
  const [horizon, setHorizon] = useState<Horizon>("7d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/admin/analytics?horizon=${horizon}`, {
          signal: controller.signal,
        });
        if (ignore) return;
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (res.ok) {
          const json: AnalyticsResponse = await res.json();
          setData(json);
        }
      } catch {
        // silently fail (includes AbortError)
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchAnalytics();
    return () => { ignore = true; controller.abort(); };
  }, [horizon, router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  function handleHorizonChange(h: Horizon) {
    setHorizon(h);
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-white/40">Pookie Press dashboard</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
        >
          Sign out
        </button>
      </div>

      <div className="space-y-6">
        <StatsCards
          totalTaps={data?.summary.totalTaps ?? 0}
          weeklyCount={data?.summary.weeklyCount ?? 0}
          goal={data?.summary.goal ?? 50}
          progress={data?.summary.progress ?? 0}
          peakLabel={data?.frequency.peakLabel ?? "N/A"}
        />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-white/60">Frequency</h2>
          <HorizonSelector selected={horizon} onChange={handleHorizonChange} />
        </div>

        <FrequencyChart buckets={data?.frequency.buckets ?? []} loading={loading} />
      </div>
    </main>
  );
}
