import { create } from "zustand"
import { persist } from "zustand/middleware"

type HistoryStore = {
  recentSearches: string[]
  addRecentSearch: (symbol: string) => void
  clearRecentSearches: () => void
}

export const useHistory = create<HistoryStore>()(
  persist(
    (set) => ({
      recentSearches: [],
      addRecentSearch: (symbol) =>
        set((s) => ({
          recentSearches: [symbol, ...s.recentSearches.filter((x) => x !== symbol)].slice(0, 6),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    { name: "stock-history" }
  )
)
