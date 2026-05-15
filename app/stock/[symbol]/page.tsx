import { ChartContainerClient } from "@/components/chart/ChartContainerClient"
import { ChartSkeleton } from "@/components/chart/ChartSkeleton"
import { StatsPanel } from "@/components/stock/StatsPanel"
import { StockHeader } from "@/components/stock/StockHeader"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { DEFAULT_SETTINGS } from "@/lib/constants"
import { isValidTimeframe } from "@/lib/utils/typeGuards"
import type { Timeframe } from "@/lib/types/stock"

type Props = {
  params: Promise<{ symbol: string }>
  searchParams: Promise<{ tf?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { symbol } = await params
  return { title: `${symbol.toUpperCase()} — Stock Analyzer` }
}

export default async function StockPage({ params, searchParams }: Props) {
  const { symbol } = await params
  const { tf } = await searchParams
  const upperSymbol = symbol.toUpperCase()
  const timeframe: Timeframe = tf && isValidTimeframe(tf) ? tf : DEFAULT_SETTINGS.defaultTimeframe

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <StockHeader symbol={upperSymbol} timeframe={timeframe} />

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_320px]">
        <main className="min-h-0 p-2">
          <ErrorBoundary fallback={<ChartSkeleton />}>
            <ChartContainerClient symbol={upperSymbol} timeframe={timeframe} />
          </ErrorBoundary>
        </main>
        <aside className="overflow-hidden border-l border-zinc-800">
          <ErrorBoundary>
            <StatsPanel symbol={upperSymbol} timeframe={timeframe} />
          </ErrorBoundary>
        </aside>
      </div>
    </div>
  )
}
