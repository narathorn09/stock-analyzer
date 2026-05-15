"use client"

import { Star } from "lucide-react"

import { useWatchlist } from "@/lib/store/watchlist"
import { cn } from "@/lib/utils"

export function WatchlistButton({ symbol }: { symbol: string }) {
  const { add, remove, has } = useWatchlist()
  const inList = has(symbol)

  return (
    <button
      onClick={() => (inList ? remove(symbol) : add(symbol))}
      title={inList ? "Remove from watchlist" : "Add to watchlist"}
      className={cn(
        "rounded p-1 transition-colors",
        inList ? "text-amber-400 hover:text-amber-300" : "text-zinc-600 hover:text-zinc-300"
      )}
    >
      <Star className={cn("h-4 w-4", inList && "fill-amber-400")} />
    </button>
  )
}
