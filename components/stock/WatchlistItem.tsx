"use client"

import { X } from "lucide-react"
import Link from "next/link"

import { useQuote } from "@/lib/hooks/useQuote"
import { useWatchlist } from "@/lib/store/watchlist"
import { formatChange, formatPercent, formatPrice } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

export function WatchlistItem({ symbol }: { symbol: string }) {
  const { quote, isLoading } = useQuote(symbol)
  const remove = useWatchlist((s) => s.remove)
  const isUp = (quote?.changePercent ?? 0) >= 0

  return (
    <div className="group relative rounded-lg border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-700 transition-colors">
      <button
        onClick={() => remove(symbol)}
        className="absolute right-2 top-2 hidden group-hover:flex items-center justify-center h-5 w-5 rounded text-zinc-500 hover:text-zinc-300"
        aria-label="Remove from watchlist"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <Link href={`/stock/${symbol}`} className="block">
        <div className="font-mono text-sm font-bold text-zinc-100">{symbol}</div>

        {isLoading && <div className="mt-1 h-4 w-20 rounded bg-zinc-800 animate-pulse" />}

        {quote && !isLoading && (
          <>
            <div className="mt-1 font-mono text-lg font-semibold text-zinc-100">
              {formatPrice(quote.price)}
            </div>
            <div className={cn("text-xs font-mono", isUp ? "text-teal-400" : "text-red-400")}>
              {formatChange(quote.change)} ({formatPercent(quote.changePercent)})
            </div>
          </>
        )}
      </Link>
    </div>
  )
}
