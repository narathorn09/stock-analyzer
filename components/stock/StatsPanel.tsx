"use client"

import Image from "next/image"

import { Skeleton } from "@/components/ui/skeleton"
import { useCandles } from "@/lib/hooks/useCandles"
import { useIndicators } from "@/lib/hooks/useIndicators"
import { useProfile } from "@/lib/hooks/useProfile"
import { useQuote } from "@/lib/hooks/useQuote"
import type { PivotLevels } from "@/lib/types/indicators"
import type { Quote, Stock, Timeframe } from "@/lib/types/stock"
import {
  formatMarketCap,
  formatPercent,
  formatPrice,
  formatRatio,
  formatVolume,
} from "@/lib/utils/format"
import { cn } from "@/lib/utils"

type Props = { symbol: string; timeframe: Timeframe }

export function StatsPanel({ symbol, timeframe }: Props) {
  const { quote, isLoading: qLoading } = useQuote(symbol)
  const { profile, isLoading: pLoading } = useProfile(symbol)
  const { candles } = useCandles(symbol, timeframe)
  const indicators = useIndicators(candles, timeframe)

  return (
    <div className="flex h-full flex-col gap-0 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 text-sm">
      <HeaderSection
        quote={quote}
        profile={profile}
        symbol={symbol}
        isLoading={qLoading || pLoading}
      />
      <Divider />
      <TodaySection quote={quote} />
      <Divider />
      <VolumeSection stats={indicators.volumeStats} />
      <Divider />
      <SRLevelsSection pivots={indicators.pivots} currentPrice={quote?.price} />
      <Divider />
      <CompanySection profile={profile} />
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-zinc-800" />
}

function HeaderSection({
  quote,
  profile,
  symbol,
  isLoading,
}: {
  quote?: Quote
  profile?: Stock
  symbol: string
  isLoading: boolean
}) {
  const isUp = (quote?.changePercent ?? 0) >= 0

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-zinc-800" />
          <Skeleton className="h-8 w-32 bg-zinc-800" />
          <Skeleton className="h-4 w-20 bg-zinc-800" />
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2">
            {profile?.logo && (
              <Image
                src={profile.logo}
                alt={profile.name ?? ""}
                width={24}
                height={24}
                className="mt-0.5 rounded"
                unoptimized
              />
            )}
            <div>
              <div className="font-semibold text-zinc-100">{profile?.name ?? symbol}</div>
              <div className="text-xs text-zinc-500">
                {symbol} · {profile?.exchange ?? "—"}
              </div>
            </div>
          </div>
          {quote && (
            <div className="mt-3">
              <div className="font-mono text-2xl font-bold text-zinc-100">
                {formatPrice(quote.price)}
              </div>
              <div className={cn("font-mono text-sm", isUp ? "text-teal-400" : "text-red-400")}>
                {isUp ? "+" : ""}
                {quote.change.toFixed(2)} ({formatPercent(quote.changePercent)})
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TodaySection({ quote }: { quote?: Quote }) {
  if (!quote) return null
  const rows = [
    { label: "Open", value: formatPrice(quote.open) },
    { label: "High", value: formatPrice(quote.high) },
    { label: "Low", value: formatPrice(quote.low) },
    { label: "Prev Close", value: formatPrice(quote.previousClose) },
  ]
  return (
    <div className="p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Today</div>
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between py-0.5">
          <span className="text-zinc-500">{r.label}</span>
          <span className="font-mono text-zinc-200">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

function VolumeSection({ stats }: { stats: ReturnType<typeof useIndicators>["volumeStats"] }) {
  if (!stats) return null
  const statusColor =
    stats.status === "high"
      ? "text-teal-400"
      : stats.status === "low"
        ? "text-red-400"
        : "text-zinc-400"
  return (
    <div className="p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Volume
      </div>
      <div className="flex justify-between py-0.5">
        <span className="text-zinc-500">Current</span>
        <span className="font-mono text-zinc-200">{formatVolume(stats.current)}</span>
      </div>
      <div className="flex justify-between py-0.5">
        <span className="text-zinc-500">Avg (20)</span>
        <span className="font-mono text-zinc-200">{formatVolume(stats.average20)}</span>
      </div>
      <div className="flex justify-between py-0.5">
        <span className="text-zinc-500">Ratio</span>
        <span className={cn("font-mono", statusColor)}>{formatRatio(stats.ratio)}</span>
      </div>
    </div>
  )
}

function SRLevelsSection({
  pivots,
  currentPrice,
}: {
  pivots: PivotLevels | null
  currentPrice?: number
}) {
  if (!pivots) return null

  const levels = [
    { name: "R3", value: pivots.r3, type: "resistance" as const },
    { name: "R2", value: pivots.r2, type: "resistance" as const },
    { name: "R1", value: pivots.r1, type: "resistance" as const },
    { name: "P", value: pivots.pivot, type: "pivot" as const },
    { name: "S1", value: pivots.s1, type: "support" as const },
    { name: "S2", value: pivots.s2, type: "support" as const },
    { name: "S3", value: pivots.s3, type: "support" as const },
  ]

  const closest = currentPrice
    ? levels.reduce((p, c) =>
        Math.abs(c.value - currentPrice) < Math.abs(p.value - currentPrice) ? c : p
      )
    : null

  const typeColor = {
    resistance: "text-red-400",
    pivot: "text-amber-400",
    support: "text-teal-400",
  }

  return (
    <div className="p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        S/R Levels
      </div>
      {levels.map((l) => (
        <div
          key={l.name}
          className={cn(
            "flex justify-between py-0.5",
            l === closest && "rounded bg-zinc-800 px-1 -mx-1"
          )}
        >
          <span className={cn("font-mono text-xs font-semibold", typeColor[l.type])}>{l.name}</span>
          <span className="font-mono text-xs text-zinc-200">{l.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}

function CompanySection({ profile }: { profile?: Stock }) {
  if (!profile) return null
  return (
    <div className="p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Company
      </div>
      {profile.marketCap && (
        <div className="flex justify-between py-0.5">
          <span className="text-zinc-500">Mkt Cap</span>
          <span className="font-mono text-zinc-200">{formatMarketCap(profile.marketCap)}</span>
        </div>
      )}
      {profile.industry && (
        <div className="flex justify-between py-0.5">
          <span className="text-zinc-500">Industry</span>
          <span className="text-zinc-200 text-xs text-right max-w-[55%] truncate">
            {profile.industry}
          </span>
        </div>
      )}
    </div>
  )
}
