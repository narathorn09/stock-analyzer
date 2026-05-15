"use client"

import Link from "next/link"
import { Suspense } from "react"

import { useTimeframeShortcuts } from "@/lib/hooks/useTimeframeShortcuts"
import type { Timeframe } from "@/lib/types/stock"

import { IndicatorToggles } from "./IndicatorToggles"
import { TimeframeSelector } from "./TimeframeSelector"
import { WatchlistButton } from "./WatchlistButton"

type Props = { symbol: string; timeframe: Timeframe }

export function StockHeader({ symbol, timeframe }: Props) {
  useTimeframeShortcuts(symbol, timeframe)

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-4 py-2">
      <Link
        href="/"
        className="font-mono text-sm font-semibold text-amber-400 hover:text-amber-300"
      >
        ← StockAnalyzer
      </Link>
      <span className="font-mono text-lg font-bold text-zinc-100">{symbol}</span>
      <WatchlistButton symbol={symbol} />
      <div className="ml-3 hidden sm:flex">
        <IndicatorToggles />
      </div>
      <div className="ml-auto">
        <Suspense>
          <TimeframeSelector symbol={symbol} current={timeframe} />
        </Suspense>
      </div>
    </div>
  )
}
