"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { TIMEFRAMES, TIMEFRAME_LABELS } from "@/lib/constants"
import type { Timeframe } from "@/lib/types/stock"
import { cn } from "@/lib/utils"

type Props = { symbol: string; current: Timeframe }

export function TimeframeSelector({ symbol, current }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function select(tf: Timeframe) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tf", tf)
    router.push(`/stock/${symbol}?${params.toString()}`)
  }

  return (
    <div className="flex gap-1">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => select(tf)}
          className={cn(
            "rounded px-2.5 py-1 font-mono text-xs font-medium transition-colors",
            current === tf
              ? "bg-amber-500 text-zinc-950"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          )}
        >
          {TIMEFRAME_LABELS[tf]}
        </button>
      ))}
    </div>
  )
}
