import { BarChart3, Star } from "lucide-react"

import { WatchlistGrid } from "@/components/stock/WatchlistGrid"
import { StockSearch } from "@/components/stock/StockSearch"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-4 flex items-center gap-2 text-amber-400">
          <BarChart3 className="h-8 w-8" />
          <span className="text-3xl font-bold tracking-tight">StockAnalyzer</span>
        </div>
        <p className="mb-8 max-w-md text-zinc-400">
          US stock charts with automatic support &amp; resistance levels. Free. No sign-up.
        </p>
        <div className="w-full max-w-sm">
          <StockSearch className="w-full" />
        </div>
        <p className="mt-3 text-xs text-zinc-600">Try: AAPL · TSLA · NVDA · MSFT · AMZN</p>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 pb-16">
        <div className="mb-4 flex items-center gap-2 text-zinc-300">
          <Star className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Watchlist</h2>
        </div>
        <WatchlistGrid />
      </div>
    </div>
  )
}
