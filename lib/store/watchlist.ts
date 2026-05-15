import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { WatchlistItem } from "@/lib/types/stock"

type WatchlistStore = {
  items: WatchlistItem[]
  add: (symbol: string) => void
  remove: (symbol: string) => void
  has: (symbol: string) => boolean
}

export const useWatchlist = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (symbol) => {
        if (!get().has(symbol)) {
          set((s) => ({ items: [...s.items, { symbol, addedAt: Date.now() }] }))
        }
      },
      remove: (symbol) => set((s) => ({ items: s.items.filter((i) => i.symbol !== symbol) })),
      has: (symbol) => get().items.some((i) => i.symbol === symbol),
    }),
    { name: "stock-watchlist" }
  )
)
