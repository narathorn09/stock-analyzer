import type { Candle } from "@/lib/types/stock"
import type { VWAPPoint } from "@/lib/types/indicators"

// Cumulative VWAP reset each trading day (group by date)
export function calculateVWAP(candles: Candle[]): VWAPPoint[] {
  const result: VWAPPoint[] = []
  let cumPV = 0
  let cumVol = 0
  let lastDay = ""

  for (const c of candles) {
    const day = new Date(c.time * 1000).toISOString().slice(0, 10)

    // Reset at start of each new day
    if (day !== lastDay) {
      cumPV = 0
      cumVol = 0
      lastDay = day
    }

    const typicalPrice = (c.high + c.low + c.close) / 3
    cumPV += typicalPrice * c.volume
    cumVol += c.volume

    result.push({
      time: c.time,
      vwap: cumVol > 0 ? cumPV / cumVol : typicalPrice,
    })
  }

  return result
}
