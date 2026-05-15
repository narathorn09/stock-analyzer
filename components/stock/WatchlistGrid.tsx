"use client"

import { Star } from "lucide-react"

import { WatchlistItem } from "@/components/stock/WatchlistItem"
import { useWatchlist } from "@/lib/store/watchlist"

export function WatchlistGrid() {
  const items = useWatchlist((s) => s.items)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-zinc-800 py-16 text-center">
        <Star className="h-8 w-8 text-zinc-700" />
        <p className="text-sm text-zinc-500">Your watchlist is empty.</p>
        <p className="text-xs text-zinc-600">Search for a stock and click ★ to add it here.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <WatchlistItem key={item.symbol} symbol={item.symbol} />
      ))}
    </div>
  )
}
