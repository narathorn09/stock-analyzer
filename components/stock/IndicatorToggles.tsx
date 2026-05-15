"use client"

import { useSettings } from "@/lib/store/settings"
import type { IndicatorVisibility } from "@/lib/types/settings"
import { cn } from "@/lib/utils"

const LABELS: Record<keyof IndicatorVisibility, string> = {
  pivots: "Pivots",
  swings: "Swings",
  vwap: "VWAP",
  volumeMA: "Vol MA",
}

export function IndicatorToggles() {
  const { indicators, setIndicator } = useSettings()

  return (
    <div className="flex gap-1">
      {(Object.keys(LABELS) as (keyof IndicatorVisibility)[]).map((key) => (
        <button
          key={key}
          onClick={() => setIndicator(key, !indicators[key])}
          className={cn(
            "rounded px-2 py-0.5 font-mono text-xs transition-colors",
            indicators[key]
              ? "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
              : "text-zinc-600 hover:text-zinc-400"
          )}
        >
          {LABELS[key]}
        </button>
      ))}
    </div>
  )
}
